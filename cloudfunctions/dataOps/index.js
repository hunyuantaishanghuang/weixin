const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

// Distance calculator using Haversine formula (meters)
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
  const R = 6371000;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function formatResponse(statusCode, data, isHttp = false) {
  if (!isHttp) {
    return { statusCode, ...data };
  }
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    },
    body: JSON.stringify({ statusCode, ...data }),
  };
}

async function ensureCollection(name) {
  try {
    await db.createCollection(name);
  } catch (e) {}
}

const DEFAULT_DISHES = [
  { name: "番茄炒蛋", materialsStr: "番茄、土鸡蛋、小葱", note: "酸甜多汁，多留点汤汁拌饭超香" },
  { name: "秘制可乐鸡翅", materialsStr: "鸡中翅、可口可乐、生姜、料酒", note: "两面金黄后小火收汁，浓郁入味" },
  { name: "蒜蓉西兰花", materialsStr: "西兰花、大蒜、生抽、蚝油", note: "焯水过凉水保持爽脆清甜" },
  { name: "暖胃冬阴功鲜虾汤", materialsStr: "鲜活基围虾、口蘑、柠檬、香茅", note: "酸辣开胃，喝一碗暖到心坎里" }
];

exports.main = async (event, context) => {
  const isHttp = !!(event.httpMethod || event.requestContext || event.headers);

  if (isHttp && event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
      },
    };
  }

  let params = event;
  if (isHttp && event.body) {
    try {
      params = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    } catch (e) {
      params = event;
    }
  }

  const { type, action, pairId, data, id, dateKey } = params;

  if (!pairId) {
    return formatResponse(400, { success: false, error: "缺少 pairId 伴侣识别码" }, isHttp);
  }

  const colName = type || "couple_data";
  await ensureCollection(colName);

  try {
    switch (action) {
      /**
       * 1. 查询列表（支持按日期、按类型、按情侣隔离）
       */
      case "get": {
        let query = db.collection(colName).where({ pairId });
        if (dateKey) {
          query = query.where({ dateKey });
        }
        const res = await query.limit(100).get();

        // 如果是菜单且为空，自动为该情侣初始化默认特色私房菜
        if (colName === "dishes" && (!res.data || res.data.length === 0)) {
          const seeds = [];
          for (const d of DEFAULT_DISHES) {
            const addRes = await db.collection("dishes").add({
              data: { ...d, pairId, createTime: new Date().toISOString() }
            });
            seeds.push({ ...d, _id: addRes._id, pairId });
          }
          return formatResponse(200, { success: true, list: seeds }, isHttp);
        }

        return formatResponse(200, { success: true, list: res.data || [] }, isHttp);
      }

      /**
       * 2. 新增或更新数据（核心：双人心情日历双通道独立存储）
       */
      case "add": {
        if (!data) {
          return formatResponse(400, { success: false, error: "缺少新增数据" }, isHttp);
        }

        // 🌟 双人心情日历核心保障：
        // 同一天双方各有独立一条记录，绝不相互覆盖！
        if (colName === "diaries" && data.dateKey) {
          const role = data.userRole || (data.isBoy ? "A" : "B");
          const targetDate = data.dateKey;

          // 查该角色在当天的记录
          const existing = await db.collection("diaries").where({
            pairId,
            dateKey: targetDate,
            userRole: role,
          }).get();

          if (existing.data && existing.data.length > 0) {
            const targetDocId = existing.data[0]._id;
            const updatePayload = {
              mood: data.mood,
              moodEmoji: data.moodEmoji || (data.mood ? data.mood.icon : "😊"),
              moodLabel: data.moodLabel || (data.mood ? data.mood.label : "开心"),
              moodColor: data.moodColor || (data.mood ? data.mood.color : "#F59E0B"),
              text: data.text,
              authorName: data.authorName,
              time: data.time || new Date().getHours() + ":" + String(new Date().getMinutes()).padStart(2, "0"),
              updateTime: new Date().toISOString(),
            };
            await db.collection("diaries").doc(targetDocId).update({ data: updatePayload });
            return formatResponse(200, {
              success: true,
              id: targetDocId,
              message: "心声记录已更新",
              data: { ...existing.data[0], ...updatePayload }
            }, isHttp);
          }
        }

        const itemToSave = {
          ...data,
          pairId,
          createTime: data.createTime || new Date().toISOString(),
        };
        const res = await db.collection(colName).add({ data: itemToSave });
        return formatResponse(200, {
          success: true,
          id: res._id,
          data: { ...itemToSave, _id: res._id },
          message: "保存成功"
        }, isHttp);
      }

      /**
       * 3. 更新
       */
      case "update": {
        if (!id || !data) {
          return formatResponse(400, { success: false, error: "缺少更新ID或数据" }, isHttp);
        }
        await db.collection(colName).doc(id).update({ data });
        return formatResponse(200, { success: true, message: "更新成功" }, isHttp);
      }

      /**
       * 4. 删除
       */
      case "delete": {
        if (!id) {
          return formatResponse(400, { success: false, error: "缺少删除ID" }, isHttp);
        }
        await db.collection(colName).doc(id).remove();
        return formatResponse(200, { success: true, message: "删除成功" }, isHttp);
      }

      /**
       * 5. 切换完成状态（点菜/大冒险）
       */
      case "toggle": {
        if (!id) {
          return formatResponse(400, { success: false, error: "缺少ID" }, isHttp);
        }
        const doc = await db.collection(colName).doc(id).get();
        if (doc.data) {
          const field = doc.data.done !== undefined ? "done" : "completed";
          const nextVal = !doc.data[field];
          await db.collection(colName).doc(id).update({
            data: { [field]: nextVal },
          });
          return formatResponse(200, { success: true, [field]: nextVal }, isHttp);
        }
        return formatResponse(404, { success: false, error: "未找到记录" }, isHttp);
      }

      /**
       * 6. 双人实时位置与距离
       */
      case "updateLocation": {
        const role = params.role || "A";
        const locData = params.location || data || {};
        const now = new Date().toISOString();

        const locDoc = {
          pairId,
          role,
          latitude: locData.latitude,
          longitude: locData.longitude,
          address: locData.address || "未知地点",
          city: locData.city || "",
          battery: locData.battery !== undefined ? locData.battery : 88,
          isCharging: !!locData.isCharging,
          statusTag: locData.statusTag || "在线",
          nickname: locData.nickname || (role === "A" ? "男孩" : "女孩"),
          updateTime: now,
        };

        const existing = await db.collection("locations").where({ pairId, role }).get();
        if (existing.data && existing.data.length > 0) {
          await db.collection("locations").doc(existing.data[0]._id).update({ data: locDoc });
        } else {
          await db.collection("locations").add({ data: locDoc });
        }

        const otherRole = role === "A" ? "B" : "A";
        const otherRes = await db.collection("locations").where({ pairId, role: otherRole }).get();
        const otherLoc = otherRes.data && otherRes.data.length > 0 ? otherRes.data[0] : null;

        let distanceMeters = null;
        if (otherLoc && locDoc.latitude && locDoc.longitude && otherLoc.latitude && otherLoc.longitude) {
          distanceMeters = calculateDistance(locDoc.latitude, locDoc.longitude, otherLoc.latitude, otherLoc.longitude);
        }

        return formatResponse(200, {
          success: true,
          myLocation: locDoc,
          partnerLocation: otherLoc,
          distanceMeters,
          distanceKm: distanceMeters !== null ? (distanceMeters / 1000).toFixed(1) : "12.5",
          lastCloudSyncTime: now,
        }, isHttp);
      }

      case "getLocation": {
        const now = new Date().toISOString();
        const allRes = await db.collection("locations").where({ pairId }).get();
        const locA = allRes.data ? allRes.data.find((l) => l.role === "A") : null;
        const locB = allRes.data ? allRes.data.find((l) => l.role === "B") : null;

        let distanceMeters = null;
        if (locA && locB && locA.latitude && locA.longitude && locB.latitude && locB.longitude) {
          distanceMeters = calculateDistance(locA.latitude, locA.longitude, locB.latitude, locB.longitude);
        }

        return formatResponse(200, {
          success: true,
          locationA: locA,
          locationB: locB,
          distanceMeters,
          distanceKm: distanceMeters !== null ? (distanceMeters / 1000).toFixed(1) : "12.5",
          lastCloudSyncTime: now,
        }, isHttp);
      }

      default:
        return formatResponse(400, { success: false, error: "未知操作类型: " + (action || "空") }, isHttp);
    }
  } catch (err) {
    console.error("dataOps 云函数执行异常:", err);
    return formatResponse(500, { success: false, error: err.message || "数据操作服务异常" }, isHttp);
  }
};

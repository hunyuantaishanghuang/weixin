const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;

// Distance calculator using Haversine formula (returns meters)
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

// CORS Response helper
function formatResponse(statusCode, data, isHttp = false) {
  if (!isHttp) return data;
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    },
    body: JSON.stringify(data),
  };
}

exports.main = async (event, context) => {
  const isHttp = !!event.httpMethod;

  // Handle CORS Preflight for HTTP mode
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

  // Parse payload whether called via HTTP body or standard event
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

  try {
    const colName = type; // dishes, orders, periods, diaries, messages, statuses, adventures, pokes

    switch (action) {
      case "get": {
        let query = db.collection(colName).where({ pairId });
        if (dateKey) {
          query = query.where({ dateKey });
        }
        const res = await query.limit(100).get();
        return formatResponse(200, { success: true, list: res.data }, isHttp);
      }

      case "add": {
        if (!data) {
          return formatResponse(400, { success: false, error: "缺少新增数据" }, isHttp);
        }
        const itemToSave = {
          ...data,
          pairId,
          createTime: data.createTime || new Date().toISOString(),
        };
        const res = await db.collection(colName).add({ data: itemToSave });
        return formatResponse(200, { success: true, id: res._id, data: { ...itemToSave, _id: res._id } }, isHttp);
      }

      case "update": {
        if (!id || !data) {
          return formatResponse(400, { success: false, error: "缺少更新ID或数据" }, isHttp);
        }
        await db.collection(colName).doc(id).update({ data });
        return formatResponse(200, { success: true, message: "更新成功" }, isHttp);
      }

      case "delete": {
        if (!id) {
          return formatResponse(400, { success: false, error: "缺少删除ID" }, isHttp);
        }
        await db.collection(colName).doc(id).remove();
        return formatResponse(200, { success: true, message: "删除成功" }, isHttp);
      }

      case "toggle": {
        // Toggle done status (for menu order) or complete status (for adventure)
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

      case "like": {
        // Increment/decrement likes for message note
        if (!id) {
          return formatResponse(400, { success: false, error: "缺少ID" }, isHttp);
        }
        await db.collection(colName).doc(id).update({
          data: {
            likes: _.inc(1),
          },
        });
        return formatResponse(200, { success: true, message: "点赞成功" }, isHttp);
      }

      // --- 📍 实时位置与双人距离计算 (云端实时计算通信) ---
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

        // 写入/覆盖该角色在当前 pairId 的最新位置记录
        const existing = await db.collection("locations").where({ pairId, role }).get();
        if (existing.data.length > 0) {
          await db.collection("locations").doc(existing.data[0]._id).update({ data: locDoc });
        } else {
          await db.collection("locations").add({ data: locDoc });
        }

        // 获取对方的最新位置
        const otherRole = role === "A" ? "B" : "A";
        const otherRes = await db.collection("locations").where({ pairId, role: otherRole }).get();
        const otherLoc = otherRes.data.length > 0 ? otherRes.data[0] : null;

        let distanceMeters = null;
        let isNearBluetooth = false;
        if (otherLoc && locDoc.latitude && locDoc.longitude && otherLoc.latitude && otherLoc.longitude) {
          distanceMeters = calculateDistance(locDoc.latitude, locDoc.longitude, otherLoc.latitude, otherLoc.longitude);
          isNearBluetooth = distanceMeters !== null && distanceMeters <= 25; // 25米以内进入近场蓝牙感应范围
        }

        return formatResponse(200, {
          success: true,
          myLocation: locDoc,
          partnerLocation: otherLoc,
          distanceMeters,
          isNearBluetooth,
          lastCloudSyncTime: now,
        }, isHttp);
      }

      case "getLocation": {
        const now = new Date().toISOString();
        const allRes = await db.collection("locations").where({ pairId }).get();
        const locA = allRes.data.find((l) => l.role === "A") || null;
        const locB = allRes.data.find((l) => l.role === "B") || null;

        let distanceMeters = null;
        let isNearBluetooth = false;
        if (locA && locB && locA.latitude && locA.longitude && locB.latitude && locB.longitude) {
          distanceMeters = calculateDistance(locA.latitude, locA.longitude, locB.latitude, locB.longitude);
          isNearBluetooth = distanceMeters !== null && distanceMeters <= 25;
        }

        return formatResponse(200, {
          success: true,
          locationA: locA,
          locationB: locB,
          distanceMeters,
          isNearBluetooth,
          lastCloudSyncTime: now,
        }, isHttp);
      }

      default:
        return formatResponse(400, { success: false, error: "未知操作类型: " + action }, isHttp);
    }
  } catch (err) {
    console.error("dataOps cloud function error:", err);
    return formatResponse(500, { success: false, error: err.message }, isHttp);
  }
};

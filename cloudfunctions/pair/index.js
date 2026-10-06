const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const PAIRS_COLLECTION = "pairs";
const USERS_COLLECTION = "users";

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

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

async function ensureCollection(name) {
  try {
    await db.createCollection(name);
  } catch (e) {}
}

exports.main = async (event, context) => {
  const isHttp = !!(event.httpMethod || event.requestContext || event.headers);

  await ensureCollection(PAIRS_COLLECTION);
  await ensureCollection(USERS_COLLECTION);

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

  const { action, userId, nickname, gender, avatar, role } = params;
  const rawCode = params.pairId || params.inviteCode || params.code || "";
  const wxContext = cloud.getWXContext();
  const callerId = wxContext.OPENID || userId || "usr_" + Date.now();

  try {
    switch (action) {
      /**
       * 1. 生成唯一 6 位情侣配对码
       */
      case "create": {
        let newCode = genCode();
        let exists = await db.collection(PAIRS_COLLECTION).where({ pairId: newCode }).get();
        let retry = 0;
        while (exists.data && exists.data.length > 0 && retry < 5) {
          newCode = genCode();
          exists = await db.collection(PAIRS_COLLECTION).where({ pairId: newCode }).get();
          retry++;
        }

        const now = new Date();
        const pairDoc = {
          pairId: newCode,
          status: "waiting", // waiting -> bound
          memberA: callerId,
          memberB: "",
          nicknameA: nickname || "男孩",
          nicknameB: "等待TA加入",
          genderA: gender || "male",
          genderB: gender === "male" ? "female" : "male",
          avatarA: avatar || (gender === "female" ? "👧" : "👦"),
          avatarB: "💕",
          createTime: now.toISOString(),
          bindTime: "",
          anniversaryDate: now.toISOString().split("T")[0],
        };

        const res = await db.collection(PAIRS_COLLECTION).add({ data: pairDoc });

        // 同步更新创建者用户表中的 pairId
        if (userId) {
          try {
            await db.collection(USERS_COLLECTION).doc(userId).update({ data: { pairId: newCode, role: "A" } });
          } catch (e) {}
        } else if (wxContext.OPENID) {
          try {
            const uq = await db.collection(USERS_COLLECTION).where({ openid: wxContext.OPENID }).get();
            if (uq.data && uq.data.length > 0) {
              await db.collection(USERS_COLLECTION).doc(uq.data[0]._id).update({ data: { pairId: newCode, role: "A" } });
            }
          } catch (e) {}
        }

        return formatResponse(200, {
          success: true,
          message: "配对邀请码生成成功",
          pairId: newCode,
          inviteCode: newCode,
          pair: { ...pairDoc, _id: res._id },
        }, isHttp);
      }

      /**
       * 2. 输入配对码完成双人绑定
       */
      case "join": {
        if (!rawCode) {
          return formatResponse(400, { success: false, error: "请输入6位情侣配对码" }, isHttp);
        }

        const targetCode = String(rawCode).trim().toUpperCase();
        const query = await db.collection(PAIRS_COLLECTION).where({ pairId: targetCode }).get();

        if (!query.data || query.data.length === 0) {
          return formatResponse(404, { success: false, error: "未找到该配对码，请核对是否正确" }, isHttp);
        }

        const pairDoc = query.data[0];

        // 已经绑定且不是当前重试
        if (pairDoc.status === "bound" && pairDoc.memberB && pairDoc.memberB !== callerId) {
          return formatResponse(400, { success: false, error: "该配对码已与其他人绑定" }, isHttp);
        }

        const now = new Date().toISOString();
        const updateData = {
          status: "bound",
          memberB: callerId,
          nicknameB: nickname || (pairDoc.genderA === "male" ? "女孩" : "男孩"),
          genderB: gender || (pairDoc.genderA === "male" ? "female" : "male"),
          avatarB: avatar || (gender === "male" ? "👦" : "👧"),
          bindTime: now,
        };

        await db.collection(PAIRS_COLLECTION).doc(pairDoc._id).update({ data: updateData });

        // 更新双方 users 表关联
        const updatedPair = { ...pairDoc, ...updateData };

        if (userId) {
          try {
            await db.collection(USERS_COLLECTION).doc(userId).update({ data: { pairId: targetCode, role: "B" } });
          } catch (e) {}
        } else if (wxContext.OPENID) {
          try {
            const uq = await db.collection(USERS_COLLECTION).where({ openid: wxContext.OPENID }).get();
            if (uq.data && uq.data.length > 0) {
              await db.collection(USERS_COLLECTION).doc(uq.data[0]._id).update({ data: { pairId: targetCode, role: "B" } });
            }
          } catch (e) {}
        }

        return formatResponse(200, {
          success: true,
          message: "🎉 恭喜配对成功！",
          pairId: targetCode,
          pair: updatedPair,
        }, isHttp);
      }

      /**
       * 3. 获取情侣详细信息
       */
      case "get":
      case "getPair": {
        if (!rawCode) {
          return formatResponse(400, { success: false, error: "缺少配对识别码" }, isHttp);
        }
        const targetCode = String(rawCode).trim().toUpperCase();
        const query = await db.collection(PAIRS_COLLECTION).where({ pairId: targetCode }).get();

        if (!query.data || query.data.length === 0) {
          return formatResponse(404, { success: false, error: "未找到该情侣绑定信息" }, isHttp);
        }

        return formatResponse(200, {
          success: true,
          pair: query.data[0],
          pairId: targetCode,
        }, isHttp);
      }

      /**
       * 4. 解除情侣绑定
       */
      case "unbind": {
        if (!rawCode) {
          return formatResponse(400, { success: false, error: "缺少配对识别码" }, isHttp);
        }
        const targetCode = String(rawCode).trim().toUpperCase();
        const query = await db.collection(PAIRS_COLLECTION).where({ pairId: targetCode }).get();

        if (query.data && query.data.length > 0) {
          await db.collection(PAIRS_COLLECTION).doc(query.data[0]._id).remove();
        }

        // 清理当前用户的 pairId
        if (userId) {
          try {
            await db.collection(USERS_COLLECTION).doc(userId).update({ data: { pairId: "" } });
          } catch (e) {}
        }

        return formatResponse(200, {
          success: true,
          message: "已成功解除伴侣绑定",
        }, isHttp);
      }

      default:
        return formatResponse(400, { success: false, error: "未知操作类型: " + (action || "空") }, isHttp);
    }
  } catch (err) {
    console.error("Pair 云函数执行异常:", err);
    return formatResponse(500, { success: false, error: err.message || "配对服务异常" }, isHttp);
  }
};

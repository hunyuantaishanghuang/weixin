const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const PAIRS_COLLECTION = "pairs";

// Helper for CORS & HTTP response
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
  } catch (e) {
    // 集合已存在或创建忽略
  }
}

exports.main = async (event, context) => {
  const isHttp = !!event.httpMethod;

  await ensureCollection(PAIRS_COLLECTION);
  await ensureCollection("users");

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

  const { action, pairId, userId, nickname, gender, role } = params;
  const wxContext = cloud.getWXContext();
  const callerOpenId = wxContext.OPENID || userId || "user_" + Date.now();

  try {
    switch (action) {
      case "create": {
        // Create a new unique 6-digit pair code
        let newCode = genCode();
        let exists = await db.collection(PAIRS_COLLECTION).where({ pairId: newCode }).get();
        while (exists.data.length > 0) {
          newCode = genCode();
          exists = await db.collection(PAIRS_COLLECTION).where({ pairId: newCode }).get();
        }

        const now = new Date();
        const pairDoc = {
          pairId: newCode,
          status: "created", // created -> pending -> bound
          memberA: callerOpenId,
          memberB: "",
          nicknameA: nickname || "我",
          nicknameB: "TA",
          genderA: gender || "male",
          genderB: "female",
          createTime: now.toISOString(),
        };

        const res = await db.collection(PAIRS_COLLECTION).add({ data: pairDoc });
        return formatResponse(200, { success: true, pair: { ...pairDoc, _id: res._id } }, isHttp);
      }

      case "join": {
        if (!pairId) {
          return formatResponse(400, { success: false, error: "缺少伴侣识别码" }, isHttp);
        }
        const query = await db.collection(PAIRS_COLLECTION).where({ pairId: pairId.toUpperCase() }).get();
        if (query.data.length === 0) {
          return formatResponse(404, { success: false, error: "未找到该识别码，请核对" }, isHttp);
        }

        const pairDoc = query.data[0];
        if (pairDoc.status === "bound") {
          return formatResponse(400, { success: false, error: "该识别码已与他人绑定" }, isHttp);
        }

        await db.collection(PAIRS_COLLECTION).doc(pairDoc._id).update({
          data: {
            status: "pending",
            pendingB: callerOpenId,
            nicknameB: nickname || pairDoc.nicknameB || "TA",
            genderB: gender || "female",
          },
        });

        return formatResponse(200, { success: true, message: "申请已提交，等待对方确认", pairId }, isHttp);
      }

      case "confirm": {
        if (!pairId) {
          return formatResponse(400, { success: false, error: "缺少伴侣识别码" }, isHttp);
        }
        const query = await db.collection(PAIRS_COLLECTION).where({ pairId: pairId.toUpperCase() }).get();
        if (query.data.length === 0) {
          return formatResponse(404, { success: false, error: "未找到该伴侣关系" }, isHttp);
        }
        const pairDoc = query.data[0];
        const now = new Date();

        await db.collection(PAIRS_COLLECTION).doc(pairDoc._id).update({
          data: {
            status: "bound",
            memberB: pairDoc.pendingB || "user_b",
            pendingB: null,
            bindTime: now.toISOString(),
          },
        });

        return formatResponse(200, { success: true, message: "绑定成功！", status: "bound" }, isHttp);
      }

      case "get": {
        if (!pairId) {
          return formatResponse(400, { success: false, error: "缺少识别码" }, isHttp);
        }
        const query = await db.collection(PAIRS_COLLECTION).where({ pairId: pairId.toUpperCase() }).get();
        if (query.data.length === 0) {
          return formatResponse(404, { success: false, error: "未找到该伴侣信息" }, isHttp);
        }
        return formatResponse(200, { success: true, pair: query.data[0] }, isHttp);
      }

      case "unbind": {
        if (!pairId) {
          return formatResponse(400, { success: false, error: "缺少识别码" }, isHttp);
        }
        const query = await db.collection(PAIRS_COLLECTION).where({ pairId: pairId.toUpperCase() }).get();
        if (query.data.length > 0) {
          await db.collection(PAIRS_COLLECTION).doc(query.data[0]._id).remove();
        }
        return formatResponse(200, { success: true, message: "已解除绑定" }, isHttp);
      }

      default:
        return formatResponse(400, { success: false, error: "未知操作类型: " + action }, isHttp);
    }
  } catch (err) {
    console.error("Pair cloud function error:", err);
    return formatResponse(500, { success: false, error: err.message }, isHttp);
  }
};

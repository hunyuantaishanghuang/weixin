const cloud = require("wx-server-sdk");
const crypto = require("crypto");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;
const USERS_COLLECTION = "users";
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

// Password hashing with salt
function hashPassword(password, salt) {
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

function generateToken(userId) {
  const payload = `${userId}:${Date.now()}:${Math.random().toString(36).substring(2)}`;
  return crypto.createHash("md5").update(payload).digest("hex");
}

exports.main = async (event, context) => {
  const isHttp = !!event.httpMethod;

  // Handle CORS Preflight for HTTP mode (Android / HarmonyOS / Web)
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

  const { action, username, password, nickname, gender, avatar, openid, token, userId } = params;
  const wxContext = cloud.getWXContext();
  const callerOpenId = wxContext.OPENID || openid || "";

  try {
    switch (action) {
      /**
       * 1. 微信一键授权免密登录 (WeChat One-Tap Auth)
       * 小程序端直接获取真实 OPENID，Web / 多端可传 openid
       */
      case "wechatLogin": {
        const targetOpenId = callerOpenId || "wx_guest_" + Date.now().toString(36);
        const now = new Date().toISOString();

        // 查找是否已存在该微信用户
        const userQuery = await db.collection(USERS_COLLECTION).where({ openid: targetOpenId }).get();
        let userDoc;

        if (userQuery.data.length > 0) {
          userDoc = userQuery.data[0];
          // 更新最后登录时间与昵称头像（如果有传新的）
          const updateData = { lastLoginTime: now };
          if (nickname) updateData.nickname = nickname;
          if (avatar) updateData.avatar = avatar;
          if (gender) updateData.gender = gender;
          await db.collection(USERS_COLLECTION).doc(userDoc._id).update({ data: updateData });
          userDoc = { ...userDoc, ...updateData };
        } else {
          // 新注册微信用户
          const newUser = {
            openid: targetOpenId,
            username: `wx_${targetOpenId.substring(targetOpenId.length - 8)}`,
            loginType: "wechat",
            nickname: nickname || "微信小可爱",
            avatar: avatar || "👦",
            gender: gender || "male",
            pairId: "",
            createTime: now,
            lastLoginTime: now,
          };
          const res = await db.collection(USERS_COLLECTION).add({ data: newUser });
          userDoc = { ...newUser, _id: res._id };
        }

        // 查找该用户是否已在 pairs 表中绑定伴侣
        let pairInfo = null;
        const pairQuery = await db.collection(PAIRS_COLLECTION).where(
          _.or([
            { memberA: targetOpenId },
            { memberB: targetOpenId }
          ])
        ).get();

        if (pairQuery.data.length > 0) {
          pairInfo = pairQuery.data[0];
        }

        const sessionToken = generateToken(userDoc._id || targetOpenId);
        return formatResponse(200, {
          success: true,
          message: "微信一键登录成功",
          token: sessionToken,
          user: {
            id: userDoc._id || targetOpenId,
            openid: targetOpenId,
            username: userDoc.username,
            nickname: userDoc.nickname,
            avatar: userDoc.avatar,
            gender: userDoc.gender,
            loginType: "wechat",
            pairId: pairInfo ? pairInfo.pairId : userDoc.pairId || "",
          },
          pair: pairInfo,
        }, isHttp);
      }

      /**
       * 2. 账号密码注册 (Account Register)
       * 适用于 Android App, 鸿蒙 App, 网页端或想要独立账号的用户
       */
      case "register": {
        if (!username || !password) {
          return formatResponse(400, { success: false, error: "用户名和密码不能为空" }, isHttp);
        }

        const cleanUsername = username.trim().toLowerCase();
        if (cleanUsername.length < 3) {
          return formatResponse(400, { success: false, error: "用户名至少3位字符" }, isHttp);
        }
        if (password.length < 6) {
          return formatResponse(400, { success: false, error: "密码长度至少6位" }, isHttp);
        }

        // 检查用户名是否已被占用
        const exists = await db.collection(USERS_COLLECTION).where({ username: cleanUsername }).get();
        if (exists.data.length > 0) {
          return formatResponse(400, { success: false, error: "该用户名已被注册，请直接登录或换一个" }, isHttp);
        }

        const salt = crypto.randomBytes(8).toString("hex");
        const passwordHash = hashPassword(password, salt);
        const now = new Date().toISOString();

        const newUser = {
          username: cleanUsername,
          passwordHash,
          salt,
          loginType: "account",
          nickname: nickname || cleanUsername,
          avatar: avatar || (gender === "female" ? "👧" : "👦"),
          gender: gender || "male",
          pairId: "",
          createTime: now,
          lastLoginTime: now,
        };

        const addRes = await db.collection(USERS_COLLECTION).add({ data: newUser });
        const sessionToken = generateToken(addRes._id);

        return formatResponse(200, {
          success: true,
          message: "注册成功并已自动登录",
          token: sessionToken,
          user: {
            id: addRes._id,
            username: cleanUsername,
            nickname: newUser.nickname,
            avatar: newUser.avatar,
            gender: newUser.gender,
            loginType: "account",
            pairId: "",
          },
          pair: null,
        }, isHttp);
      }

      /**
       * 3. 账号密码登录 (Account Login)
       */
      case "login": {
        if (!username || !password) {
          return formatResponse(400, { success: false, error: "请输入用户名和密码" }, isHttp);
        }

        const cleanUsername = username.trim().toLowerCase();
        const userQuery = await db.collection(USERS_COLLECTION).where({ username: cleanUsername }).get();

        if (userQuery.data.length === 0) {
          return formatResponse(404, { success: false, error: "该账号不存在，请先注册" }, isHttp);
        }

        const userDoc = userQuery.data[0];
        if (!userDoc.passwordHash || !userDoc.salt) {
          return formatResponse(400, { success: false, error: "该用户为微信快捷账号，请使用微信登录" }, isHttp);
        }

        const checkHash = hashPassword(password, userDoc.salt);
        if (checkHash !== userDoc.passwordHash) {
          return formatResponse(401, { success: false, error: "密码错误，请重新输入" }, isHttp);
        }

        // 更新登录时间
        const now = new Date().toISOString();
        await db.collection(USERS_COLLECTION).doc(userDoc._id).update({
          data: { lastLoginTime: now },
        });

        // 查找是否绑定伴侣
        let pairInfo = null;
        const pairQuery = await db.collection(PAIRS_COLLECTION).where(
          _.or([
            { memberA: userDoc._id },
            { memberB: userDoc._id },
            { memberA: userDoc.username },
            { memberB: userDoc.username }
          ])
        ).get();

        if (pairQuery.data.length > 0) {
          pairInfo = pairQuery.data[0];
        }

        const sessionToken = generateToken(userDoc._id);
        return formatResponse(200, {
          success: true,
          message: "登录成功",
          token: sessionToken,
          user: {
            id: userDoc._id,
            username: userDoc.username,
            nickname: userDoc.nickname,
            avatar: userDoc.avatar,
            gender: userDoc.gender,
            loginType: userDoc.loginType || "account",
            pairId: pairInfo ? pairInfo.pairId : userDoc.pairId || "",
          },
          pair: pairInfo,
        }, isHttp);
      }

      /**
       * 4. 账号关联微信 (Link Account with WeChat OpenID)
       */
      case "bindWechat": {
        if (!userId) {
          return formatResponse(400, { success: false, error: "缺少用户ID" }, isHttp);
        }
        const targetOpenId = callerOpenId || openid;
        if (!targetOpenId) {
          return formatResponse(400, { success: false, error: "未检测到微信OpenID" }, isHttp);
        }

        await db.collection(USERS_COLLECTION).doc(userId).update({
          data: { openid: targetOpenId },
        });

        return formatResponse(200, { success: true, message: "微信账号关联成功" }, isHttp);
      }

      /**
       * 5. 获取当前登录用户信息
       */
      case "getUserInfo": {
        if (!userId && !callerOpenId) {
          return formatResponse(400, { success: false, error: "缺少用户凭据" }, isHttp);
        }

        let query = userId ? db.collection(USERS_COLLECTION).doc(userId) : db.collection(USERS_COLLECTION).where({ openid: callerOpenId });
        const res = await query.get();
        const userDoc = Array.isArray(res.data) ? res.data[0] : res.data;

        if (!userDoc) {
          return formatResponse(404, { success: false, error: "用户不存在" }, isHttp);
        }

        return formatResponse(200, {
          success: true,
          user: {
            id: userDoc._id,
            username: userDoc.username,
            nickname: userDoc.nickname,
            avatar: userDoc.avatar,
            gender: userDoc.gender,
            loginType: userDoc.loginType,
            pairId: userDoc.pairId,
          }
        }, isHttp);
      }

      default:
        return formatResponse(400, { success: false, error: `不支持的认证操作: ${action}` }, isHttp);
    }
  } catch (err) {
    console.error("Auth 云函数执行异常:", err);
    return formatResponse(500, { success: false, error: err.message || "认证服务内部错误" }, isHttp);
  }
};

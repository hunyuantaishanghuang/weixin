const cloud = require("wx-server-sdk");
const crypto = require("crypto");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;
const USERS_COLLECTION = "users";
const PAIRS_COLLECTION = "pairs";

// Universal response formatter for both WeChat callFunction and HTTP Gateway
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

// Password hashing with salt
function hashPassword(password, salt) {
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

function generateToken(userId) {
  const payload = `${userId}:${Date.now()}:${Math.random().toString(36).substring(2)}`;
  return crypto.createHash("md5").update(payload).digest("hex");
}

// Safely ensure collection exists
async function ensureCollection(name) {
  try {
    await db.createCollection(name);
  } catch (e) {
    // Collection already exists or created
  }
}

exports.main = async (event, context) => {
  const isHttp = !!(event.httpMethod || event.requestContext || event.headers);

  // Auto ensure collections exist
  await ensureCollection(USERS_COLLECTION);
  await ensureCollection(PAIRS_COLLECTION);

  // Handle CORS Preflight for HTTP
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

  // Parse payload
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
       * 1. 微信原生免密一键登录
       * 小程序端自动通过 wx.cloud.callFunction 提取真实 OPENID
       */
      case "wechatLogin": {
        const targetOpenId = callerOpenId || (userId ? `uid_${userId}` : `wx_${Date.now().toString(36)}`);
        const now = new Date().toISOString();

        // 查找是否已存在该微信用户
        let userDoc = null;
        try {
          const userQuery = await db.collection(USERS_COLLECTION).where({ openid: targetOpenId }).get();
          if (userQuery.data && userQuery.data.length > 0) {
            userDoc = userQuery.data[0];
          }
        } catch (e) {
          console.warn("User query notice:", e);
        }

        if (userDoc) {
          const updateData = { lastLoginTime: now };
          if (nickname) updateData.nickname = nickname;
          if (avatar) updateData.avatar = avatar;
          if (gender) updateData.gender = gender;
          try {
            await db.collection(USERS_COLLECTION).doc(userDoc._id).update({ data: updateData });
            userDoc = { ...userDoc, ...updateData };
          } catch (e) {}
        } else {
          // 首次进入：自动创建微信独立账号
          const newUser = {
            openid: targetOpenId,
            username: `wx_${targetOpenId.substring(Math.max(0, targetOpenId.length - 8))}`,
            loginType: "wechat",
            nickname: nickname || "微信小可爱",
            avatar: avatar || (gender === "female" ? "👧" : "👦"),
            gender: gender || "male",
            pairId: "",
            role: gender === "female" ? "B" : "A",
            createTime: now,
            lastLoginTime: now,
          };
          const res = await db.collection(USERS_COLLECTION).add({ data: newUser });
          userDoc = { ...newUser, _id: res._id };
        }

        // 检查该用户是否已在 pairs 表中绑定伴侣
        let pairInfo = null;
        const currentUserId = userDoc._id || targetOpenId;
        try {
          const pairQuery = await db.collection(PAIRS_COLLECTION).where(
            _.or([
              { memberA: targetOpenId },
              { memberB: targetOpenId },
              { memberA: currentUserId },
              { memberB: currentUserId },
            ])
          ).get();

          if (pairQuery.data && pairQuery.data.length > 0) {
            pairInfo = pairQuery.data[0];
          }
        } catch (e) {
          console.warn("Pair query notice:", e);
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
            role: userDoc.role || (userDoc.gender === "female" ? "B" : "A"),
            loginType: "wechat",
            pairId: pairInfo ? pairInfo.pairId : (userDoc.pairId || ""),
          },
          pair: pairInfo,
        }, isHttp);
      }

      /**
       * 2. 独立账号注册 (用户名 + 密码)
       * 支持多端统一账号、离线或不需要微信号也能独立注册
       */
      case "register": {
        if (!username || !password) {
          return formatResponse(400, { success: false, error: "用户名和密码不能为空" }, isHttp);
        }

        const cleanUsername = String(username).trim().toLowerCase();
        if (cleanUsername.length < 3) {
          return formatResponse(400, { success: false, error: "用户名至少3位字符" }, isHttp);
        }
        if (String(password).length < 6) {
          return formatResponse(400, { success: false, error: "密码长度至少6位" }, isHttp);
        }

        // 检查用户名是否已被占用
        const exists = await db.collection(USERS_COLLECTION).where({ username: cleanUsername }).get();
        if (exists.data && exists.data.length > 0) {
          return formatResponse(400, { success: false, error: "该用户名已被注册，请直接登录或换一个" }, isHttp);
        }

        const salt = crypto.randomBytes(8).toString("hex");
        const passwordHash = hashPassword(String(password), salt);
        const now = new Date().toISOString();
        const userGender = gender || "male";

        const newUser = {
          username: cleanUsername,
          passwordHash,
          salt,
          loginType: "account",
          nickname: nickname || cleanUsername,
          avatar: avatar || (userGender === "female" ? "👧" : "👦"),
          gender: userGender,
          role: userGender === "female" ? "B" : "A",
          pairId: "",
          openid: callerOpenId || "",
          createTime: now,
          lastLoginTime: now,
        };

        const addRes = await db.collection(USERS_COLLECTION).add({ data: newUser });
        const sessionToken = generateToken(addRes._id);

        return formatResponse(200, {
          success: true,
          message: "账号注册成功并已自动登录",
          token: sessionToken,
          user: {
            id: addRes._id,
            username: cleanUsername,
            nickname: newUser.nickname,
            avatar: newUser.avatar,
            gender: newUser.gender,
            role: newUser.role,
            loginType: "account",
            pairId: "",
          },
          pair: null,
        }, isHttp);
      }

      /**
       * 3. 独立账号登录 (用户名 + 密码)
       */
      case "login": {
        if (!username || !password) {
          return formatResponse(400, { success: false, error: "请输入用户名和密码" }, isHttp);
        }

        const cleanUsername = String(username).trim().toLowerCase();
        const userQuery = await db.collection(USERS_COLLECTION).where({ username: cleanUsername }).get();

        if (!userQuery.data || userQuery.data.length === 0) {
          return formatResponse(404, { success: false, error: "该账号不存在，请先注册" }, isHttp);
        }

        const userDoc = userQuery.data[0];
        if (!userDoc.passwordHash || !userDoc.salt) {
          return formatResponse(400, { success: false, error: "该用户为微信快捷账号，请使用微信一键登录" }, isHttp);
        }

        const checkHash = hashPassword(String(password), userDoc.salt);
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
            { memberB: userDoc.username },
            ...(userDoc.openid ? [{ memberA: userDoc.openid }, { memberB: userDoc.openid }] : [])
          ])
        ).get();

        if (pairQuery.data && pairQuery.data.length > 0) {
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
            role: userDoc.role || (userDoc.gender === "female" ? "B" : "A"),
            loginType: userDoc.loginType || "account",
            pairId: pairInfo ? pairInfo.pairId : (userDoc.pairId || ""),
          },
          pair: pairInfo,
        }, isHttp);
      }

      /**
       * 4. 更新个人资料 (昵称、头像、性别)
       */
      case "updateProfile": {
        const targetId = userId || userDoc?._id;
        if (!targetId) {
          return formatResponse(400, { success: false, error: "缺少用户ID" }, isHttp);
        }
        const updateData = {};
        if (nickname) updateData.nickname = nickname;
        if (avatar) updateData.avatar = avatar;
        if (gender) {
          updateData.gender = gender;
          updateData.role = gender === "female" ? "B" : "A";
        }
        await db.collection(USERS_COLLECTION).doc(targetId).update({ data: updateData });
        return formatResponse(200, { success: true, message: "个人资料更新成功" }, isHttp);
      }

      /**
       * 5. 获取当前用户信息
       */
      case "getUserInfo": {
        if (!userId && !callerOpenId) {
          return formatResponse(400, { success: false, error: "缺少用户凭据" }, isHttp);
        }

        let userDoc = null;
        if (userId) {
          try {
            const res = await db.collection(USERS_COLLECTION).doc(userId).get();
            userDoc = res.data;
          } catch (e) {}
        }
        if (!userDoc && callerOpenId) {
          const res = await db.collection(USERS_COLLECTION).where({ openid: callerOpenId }).get();
          if (res.data && res.data.length > 0) userDoc = res.data[0];
        }

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
            role: userDoc.role || (userDoc.gender === "female" ? "B" : "A"),
            loginType: userDoc.loginType,
            pairId: userDoc.pairId || "",
          }
        }, isHttp);
      }

      default:
        return formatResponse(400, { success: false, error: `不支持的认证操作: ${action || "未传action"}` }, isHttp);
    }
  } catch (err) {
    console.error("Auth 云函数执行异常:", err);
    return formatResponse(500, { success: false, error: err.message || "认证服务内部错误" }, isHttp);
  }
};

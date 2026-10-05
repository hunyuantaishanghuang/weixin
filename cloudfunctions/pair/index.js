const cloud = require("wx-server-sdk");
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

const db = cloud.database();
const _ = db.command;
const $ = db.command.aggregate;

// 生成 6 位唯一识别码
function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// 获取 openid
const getOpenId = async () => {
  const wxContext = cloud.getWXContext();
  return wxContext.OPENID;
};

// 读取当前用户信息（含配对状态）
const getUserInfo = async (openid) => {
  const users = await db.collection("users").where({ openid }).get();
  if (users.data.length === 0) {
    // 首次进入，创建用户记录
    const res = await db.collection("users").add({
      data: {
        openid,
        pairId: "",
        role: "", // "A" 或 "B"
        nickname: "",
        avatar: "",
        createTime: new Date(),
      },
    });
    return { openid, pairId: "", userInfo: null, _id: res._id };
  }
  const u = users.data[0];
  return {
    openid,
    pairId: u.pairId || "",
    userInfo: {
      _id: u._id,
      openid: u.openid,
      pairId: u.pairId,
      role: u.role,
      nickname: u.nickname,
      avatar: u.avatar,
    },
  };
};

// 创建配对（生成唯一识别码，作为 pairId）
const createPair = async (openid) => {
  // 检查是否已经绑定
  const me = await db.collection("users").where({ openid }).get();
  if (me.data.length && me.data[0].pairId) {
    return { success: false, msg: "您已绑定伴侣，请先解绑" };
  }
  let code = genCode();
  // 确保唯一
  let exists = await db.collection("pairs").where({ pairId: code }).get();
  while (exists.data.length > 0) {
    code = genCode();
    exists = await db.collection("pairs").where({ pairId: code }).get();
  }
  const now = new Date();
  await db.collection("pairs").add({
    data: {
      pairId: code,
      memberA: openid,
      memberB: "",
      status: "waiting", // waiting: 等待对方加入; bound: 已绑定
      createTime: now,
      bindTime: null,
    },
  });
  // 更新用户
  if (me.data.length === 0) {
    await db.collection("users").add({
      data: { openid, pairId: code, role: "A", nickname: "", avatar: "", createTime: now },
    });
  } else {
    await db.collection("users").doc(me.data[0]._id).update({
      data: { pairId: code, role: "A" },
    });
  }
  return { success: true, pairId: code, role: "A" };
};

// 加入配对（输入对方识别码，等待对方确认）
const joinPair = async (openid, code) => {
  const me = await db.collection("users").where({ openid }).get();
  if (me.data.length && me.data[0].pairId) {
    return { success: false, msg: "您已绑定伴侣，请先解绑" };
  }
  const pairs = await db.collection("pairs").where({ pairId: code }).get();
  if (pairs.data.length === 0) {
    return { success: false, msg: "识别码不存在" };
  }
  const pair = pairs.data[0];
  if (pair.status === "bound") {
    return { success: false, msg: "该关系已绑定完成，无法加入" };
  }
  if (pair.memberA === openid) {
    return { success: false, msg: "不能与自己绑定" };
  }
  // 记录待确认
  await db.collection("pairs").doc(pair._id).update({
    data: { pendingB: openid, status: "pending" },
  });
  return { success: true, status: "pending", pairId: code };
};

// 确认绑定（memberA 确认 pendingB）
const confirmBind = async (openid, code) => {
  const pairs = await db.collection("pairs").where({ pairId: code }).get();
  if (pairs.data.length === 0) return { success: false, msg: "识别码不存在" };
  const pair = pairs.data[0];
  if (pair.memberA !== openid) {
    return { success: false, msg: "只有发起方可以确认绑定" };
  }
  if (!pair.pendingB) {
    return { success: false, msg: "暂无待确认的请求" };
  }
  await db.collection("pairs").doc(pair._id).update({
    data: { memberB: pair.pendingB, pendingB: "", status: "bound", bindTime: new Date() },
  });
  // 更新双方用户 role
  await db.collection("users").where({ openid: pair.memberA }).update({ data: { pairId: code, role: "A" } });
  await db.collection("users").where({ openid: pair.memberB }).update({ data: { pairId: code, role: "B" } });
  return { success: true, pairId: code };
};

// 查询配对状态（用于轮询刷新）
const getPairStatus = async (openid, code) => {
  const pairs = await db.collection("pairs").where({ pairId: code }).get();
  if (pairs.data.length === 0) return { success: false, msg: "识别码不存在" };
  const pair = pairs.data[0];
  return {
    success: true,
    status: pair.status,
    pairId: code,
    isCreator: pair.memberA === openid,
    hasPending: !!pair.pendingB,
    bindTime: pair.bindTime,
  };
};

// 解除绑定
const unbind = async (openid) => {
  const me = await db.collection("users").where({ openid }).get();
  if (me.data.length === 0 || !me.data[0].pairId) {
    return { success: false, msg: "未绑定" };
  }
  const code = me.data[0].pairId;
  await db.collection("users").where({ pairId: code }).update({ data: { pairId: "", role: "" } });
  await db.collection("pairs").where({ pairId: code }).remove();
  return { success: true };
};

// 云函数入口
exports.main = async (event, context) => {
  const openid = await getOpenId();
  switch (event.type) {
    case "getUserInfo":
      return await getUserInfo(openid);
    case "createPair":
      return await createPair(openid);
    case "joinPair":
      return await joinPair(openid, event.code);
    case "confirmBind":
      return await confirmBind(openid, event.code);
    case "getPairStatus":
      return await getPairStatus(openid, event.code);
    case "unbind":
      return await unbind(openid);
    default:
      return { success: false, msg: "unknown type" };
  }
};

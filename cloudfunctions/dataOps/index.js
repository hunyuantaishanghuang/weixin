const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

// 获取 openid 与 pairId，保证数据隔离
async function getCtx() {
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;
  const users = await db.collection("users").where({ openid }).get();
  const pairId = users.data.length ? users.data[0].pairId : "";
  return { openid, pairId };
}

// collection 白名单，防止越权
const ALLOWED = {
  dishes: "dishes",     // 点菜：菜谱库
  menus: "menus",       // 点菜：今日点单
  periods: "periods",   // 月经记录
  diaries: "diaries",   // 心情日记
  messages: "messages", // 留言
};

exports.main = async (event) => {
  const { openid, pairId } = await getCtx();
  const coll = ALLOWED[event.collection];
  if (!coll) return { success: false, msg: "非法集合" };
  if (!pairId) return { success: false, msg: "未绑定，无法操作" };

  const col = db.collection(coll);
  const action = event.action;

  try {
    if (action === "add") {
      const data = Object.assign({}, event.data, {
        pairId,
        openid,
        createTime: new Date(),
      });
      const res = await col.add({ data });
      return { success: true, _id: res._id };
    }
    if (action === "list") {
      const res = await col
        .where({ pairId })
        .orderBy(event.orderBy || "createTime", event.order || "desc")
        .limit(event.limit || 50)
        .get();
      return { success: true, list: res.data };
    }
    if (action === "update") {
      const res = await col
        .where({ _id: event._id, pairId })
        .update({ data: event.data });
      return { success: true, updated: res.stats.updated };
    }
    if (action === "remove") {
      const res = await col.where({ _id: event._id, pairId }).remove();
      return { success: true, removed: res.stats.removed };
    }
    return { success: false, msg: "unknown action" };
  } catch (e) {
    return { success: false, errMsg: String(e) };
  }
};

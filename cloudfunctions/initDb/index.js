const cloud = require("wx-server-sdk");
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 初始化所需集合（幂等，已存在则跳过）
const COLLECTIONS = ["users", "pairs", "dishes", "menus", "periods", "diaries", "messages"];

exports.main = async () => {
  const result = {};
  for (const name of COLLECTIONS) {
    try {
      await db.createCollection(name);
      result[name] = "created";
    } catch (e) {
      // 已存在会抛错，视为成功
      result[name] = "exists";
    }
  }
  return { success: true, result };
};

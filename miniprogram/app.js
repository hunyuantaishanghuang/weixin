// app.js
App({
  globalData: {
    // 环境 ID：cloud-d3gbi9e14940c4306（来自云开发控制台）
    env: "cloud-d3gbi9e14940c4306",
    openid: "",
    pairId: "",
    userInfo: null, // { role, nickname }
  },
  onLaunch: function () {
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
      return;
    }
    wx.cloud.init({ env: this.globalData.env, traceUser: true });
    this.initDb();
    this.initUser();
  },
  // 首次启动确保数据库集合已存在（幂等）
  initDb() {
    wx.cloud.callFunction({ name: "initDb" }).catch((e) => {
      console.error("initDb skip", e);
    });
  },
  // 获取 openid 并读取已绑定关系
  initUser() {
    const that = this;
    wx.cloud.callFunction({
      name: "pair",
      data: { type: "getUserInfo" },
    }).then((res) => {
      const r = (res && res.result) || {};
      that.globalData.openid = r.openid || "";
      that.globalData.pairId = r.pairId || "";
      that.globalData.userInfo = r.userInfo || null;
      if (typeof that.onPairReady === "function") that.onPairReady();
    }).catch((e) => {
      console.error("initUser fail", e);
    });
  },
});

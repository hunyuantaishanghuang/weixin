// app.js - 原生微信小程序入口
App({
  globalData: {
    envId: "cloud-d3gbi9e14940c4306",
    userInfo: null,
    pairInfo: null,
    pairId: "",
    isBound: false,
    theme: "pink",
    unreadOrdersCount: 0
  },

  onLaunch() {
    console.log("【我们的小日子】原生小程序启动");
    
    // 1. 初始化微信云开发
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用云能力");
    } else {
      wx.cloud.init({
        env: this.globalData.envId,
        traceUser: true,
      });
      console.log("微信云开发初始化成功:", this.globalData.envId);
    }

    // 2. 自动检查并执行微信一键免密登录
    this.autoLogin();
  },

  /**
   * 自动静默登录：通过微信云开发免密获取真实 OpenID 并同步云端用户信息
   */
  autoLogin(callback) {
    if (!wx.cloud) return;

    wx.cloud.callFunction({
      name: "auth",
      data: { action: "wechatLogin" }
    }).then(res => {
      console.log("微信云端鉴权结果:", res.result);
      if (res.result && res.result.success) {
        const user = res.result.user;
        const pair = res.result.pair;

        this.globalData.userInfo = user;
        if (pair && pair.pairId) {
          this.globalData.pairInfo = pair;
          this.globalData.pairId = pair.pairId;
          this.globalData.isBound = true;
        } else if (user.pairId) {
          this.globalData.pairId = user.pairId;
          this.globalData.isBound = true;
        }

        // 保存到本地缓存以备离线使用
        wx.setStorageSync("local_user", user);
        if (this.globalData.pairId) {
          wx.setStorageSync("local_pairId", this.globalData.pairId);
        }

        if (typeof callback === "function") callback(user, pair);
      }
    }).catch(err => {
      console.warn("自动登录提示 (可能云函数未部署或离线):", err);
      // 读取本地缓存保底
      const localUser = wx.getStorageSync("local_user");
      const localPairId = wx.getStorageSync("local_pairId");
      if (localUser) {
        this.globalData.userInfo = localUser;
      }
      if (localPairId) {
        this.globalData.pairId = localPairId;
        this.globalData.isBound = true;
      }
      if (typeof callback === "function") callback(localUser, null);
    });
  },

  /**
   * 刷新配对状态
   */
  refreshPair(callback) {
    if (!wx.cloud || !this.globalData.pairId) {
      if (typeof callback === "function") callback(null);
      return;
    }

    wx.cloud.callFunction({
      name: "pair",
      data: {
        action: "getPair",
        pairId: this.globalData.pairId
      }
    }).then(res => {
      if (res.result && res.result.success && res.result.pair) {
        this.globalData.pairInfo = res.result.pair;
        this.globalData.isBound = res.result.pair.status === "bound";
        if (typeof callback === "function") callback(res.result.pair);
      }
    }).catch(() => {
      if (typeof callback === "function") callback(null);
    });
  }
});

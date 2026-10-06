// app.js - 原生微信小程序入口
App({
  globalData: {
    envId: "cloud-d3gbi9e14940c4306",
    userInfo: null,
    pairInfo: null,
    pairId: "",
    isBound: false,
    theme: "pink",
    unreadOrdersCount: 0,
    isCloudReady: false,
  },

  onLaunch() {
    console.log("【我们的小日子】100% 纯原生微信小程序启动");

    // 1. 初始化微信云开发
    if (!wx.cloud) {
      console.error("请使用 2.2.3 或以上的基础库以使用微信云能力");
    } else {
      try {
        wx.cloud.init({
          env: this.globalData.envId,
          traceUser: true,
        });
        this.globalData.isCloudReady = true;
        console.log("✅ 微信云开发初始化成功，环境ID:", this.globalData.envId);
      } catch (e) {
        console.warn("微信云开发初始化提示:", e);
      }
    }

    // 2. 读取本地缓存（确保即使网络延迟也能秒开）
    const localUser = wx.getStorageSync("local_user");
    const localPairId = wx.getStorageSync("local_pairId");
    const localPairInfo = wx.getStorageSync("local_pairInfo");

    if (localUser) {
      this.globalData.userInfo = localUser;
    }
    if (localPairId) {
      this.globalData.pairId = localPairId;
      this.globalData.isBound = true;
    }
    if (localPairInfo) {
      this.globalData.pairInfo = localPairInfo;
    }

    // 3. 自动静默拉取微信云端账号与伴侣最新状态
    this.autoLogin();
  },

  /**
   * 通用云函数调用包装器
   */
  callCloud(name, data) {
    return new Promise((resolve, reject) => {
      if (!wx.cloud) {
        reject(new Error("当前微信客户端版本过低不支持云开发"));
        return;
      }
      wx.cloud.callFunction({
        name,
        data,
      }).then(res => {
        let result = res.result;
        // 如果被网关包装为 { statusCode, body } 结构，自动解包
        if (result && typeof result.body === "string") {
          try {
            result = JSON.parse(result.body);
          } catch (e) {}
        }
        resolve(result);
      }).catch(err => {
        console.warn(`云函数 [${name}] 调用异常:`, err);
        reject(err);
      });
    });
  },

  /**
   * 自动静默登录：通过微信原生云端获取真实 OpenID 并同步用户信息
   */
  autoLogin(callback) {
    if (!wx.cloud) {
      if (typeof callback === "function") callback(this.globalData.userInfo, this.globalData.pairInfo);
      return;
    }

    this.callCloud("auth", { action: "wechatLogin" }).then(res => {
      if (res && res.success) {
        const user = res.user;
        const pair = res.pair;

        this.globalData.userInfo = user;
        wx.setStorageSync("local_user", user);

        if (pair && pair.pairId) {
          this.globalData.pairInfo = pair;
          this.globalData.pairId = pair.pairId;
          this.globalData.isBound = pair.status === "bound" || !!pair.memberB;
          wx.setStorageSync("local_pairId", pair.pairId);
          wx.setStorageSync("local_pairInfo", pair);
        } else if (user.pairId) {
          this.globalData.pairId = user.pairId;
          this.globalData.isBound = true;
          wx.setStorageSync("local_pairId", user.pairId);
          this.refreshPair();
        }

        if (typeof callback === "function") callback(user, pair);
      } else {
        if (typeof callback === "function") callback(this.globalData.userInfo, this.globalData.pairInfo);
      }
    }).catch(() => {
      if (typeof callback === "function") callback(this.globalData.userInfo, this.globalData.pairInfo);
    });
  },

  /**
   * 刷新配对状态
   */
  refreshPair(callback) {
    const pairId = this.globalData.pairId || wx.getStorageSync("local_pairId");
    if (!pairId) {
      if (typeof callback === "function") callback(null);
      return;
    }

    this.callCloud("pair", {
      action: "get",
      pairId,
    }).then(res => {
      if (res && res.success && res.pair) {
        this.globalData.pairInfo = res.pair;
        this.globalData.pairId = res.pair.pairId;
        this.globalData.isBound = res.pair.status === "bound" || !!res.pair.memberB;
        wx.setStorageSync("local_pairId", res.pair.pairId);
        wx.setStorageSync("local_pairInfo", res.pair);
        if (typeof callback === "function") callback(res.pair);
      } else {
        if (typeof callback === "function") callback(null);
      }
    }).catch(() => {
      if (typeof callback === "function") callback(null);
    });
  }
});

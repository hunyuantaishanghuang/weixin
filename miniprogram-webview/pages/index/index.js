const app = getApp();

Page({
  data: {
    webUrl: app.globalData.webUrl
  },

  onLoad(options) {
    const that = this;
    const baseUrl = app.globalData.webUrl;
    const invitePairId = options && options.pairId ? options.pairId : "";

    // 1. 尝试调用微信云开发底层安全函数，免密获取真实微信用户的唯一 OPENID
    if (wx.cloud) {
      wx.cloud.callFunction({
        name: "auth",
        data: {
          action: "wechatLogin"
        }
      }).then(res => {
        console.log("微信云端真实身份获取成功:", res.result);
        if (res.result && res.result.user) {
          const user = res.result.user;
          const pair = res.result.pair;
          const finalPairId = invitePairId || (pair ? pair.pairId : user.pairId || "");

          const urlParams = [
            `openid=${encodeURIComponent(user.openid)}`,
            `nickname=${encodeURIComponent(user.nickname || "微信用户")}`,
            `avatar=${encodeURIComponent(user.avatar || "")}`,
            `userId=${encodeURIComponent(user.id || user.openid)}`,
            `pairId=${encodeURIComponent(finalPairId)}`,
            `isRealWx=1`,
            `_t=${Date.now()}`
          ].join("&");

          const finalUrl = `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}${urlParams}`;
          that.setData({ webUrl: finalUrl });
          return;
        }
        that.fallbackLoad(baseUrl, invitePairId);
      }).catch(err => {
        console.warn("微信云函数获取身份提示 (使用降级模式):", err);
        that.fallbackLoad(baseUrl, invitePairId);
      });
    } else {
      that.fallbackLoad(baseUrl, invitePairId);
    }
  },

  fallbackLoad(baseUrl, invitePairId) {
    const sep = baseUrl.includes("?") ? "&" : "?";
    let finalUrl = `${baseUrl}${sep}_t=${Date.now()}`;
    if (invitePairId) {
      finalUrl += `&pairId=${encodeURIComponent(invitePairId)}`;
    }
    this.setData({ webUrl: finalUrl });
  },

  onShareAppMessage() {
    return {
      title: "我们的小日子 · 属于情侣的专属小世界",
      path: "/pages/index/index",
      imageUrl: "/images/share.png"
    };
  },

  onShareTimeline() {
    return {
      title: "我们的小日子 · 属于情侣的专属小世界"
    };
  },

  onWebMessage(e) {
    console.log("收到网页端消息:", e.detail);
  }
});

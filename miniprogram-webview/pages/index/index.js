const app = getApp();

Page({
  data: {
    // 默认读取全局设置的 Web 网址
    webUrl: app.globalData.webUrl
  },

  onLoad(options) {
    const baseUrl = app.globalData.webUrl;
    const sep = baseUrl.includes("?") ? "&" : "?";
    let finalUrl = `${baseUrl}${sep}_t=${Date.now()}`;
    if (options && options.pairId) {
      finalUrl += `&pairId=${options.pairId}`;
    }
    this.setData({
      webUrl: finalUrl
    });
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

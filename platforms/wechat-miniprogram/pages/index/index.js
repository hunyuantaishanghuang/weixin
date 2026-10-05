// pages/index/index.js
const app = getApp();

Page({
  data: {
    webUrl: app.globalData.webUrl,
    isLoading: true
  },

  onLoad(options) {
    let targetUrl = app.globalData.webUrl;
    
    // 如果伴侣通过微信分享卡片点入，自动附带配对码参数
    if (options && options.pairId) {
      targetUrl = `${targetUrl}?pairId=${encodeURIComponent(options.pairId)}&from=wechat_share`;
    }

    this.setData({ webUrl: targetUrl });
  },

  onWebLoad() {
    this.setData({ isLoading: false });
  },

  onWebError(e) {
    console.error("网页加载异常:", e.detail);
    wx.showToast({
      title: "网络连接中，请稍候",
      icon: "none"
    });
  },

  // 接收 H5 网页 postMessage 传来的消息（例如配对成功通知、分享参数）
  onWebMessage(e) {
    const messages = e.detail.data;
    if (messages && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      console.log("收到网页端传信:", lastMsg);
      if (lastMsg.type === "SHARE_PAIR_CODE") {
        this.currentPairCode = lastMsg.pairCode;
      }
    }
  },

  // 微信转发给好友（伴侣专属卡片）
  onShareAppMessage() {
    return {
      title: "💌 这是我们的专属小世界，快来跟我绑定吧！",
      path: this.currentPairCode 
        ? `/pages/index/index?pairId=${this.currentPairCode}`
        : "/pages/index/index",
      imageUrl: "/images/share-cover.png"
    };
  },

  // 微信分享到朋友圈
  onShareTimeline() {
    return {
      title: "我们的小日子 · 属于双人的温柔浪漫空间",
      query: this.currentPairCode ? `pairId=${this.currentPairCode}` : ""
    };
  }
});

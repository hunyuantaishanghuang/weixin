// app.js - 微信小程序入口
App({
  onLaunch() {
    // 1. 初始化微信云开发（如果已开通云开发环境）
    if (wx.cloud) {
      wx.cloud.init({
        env: "cloud-d3gbi9e14940c4306", // 您的云开发环境ID
        traceUser: true
      });
      console.log("微信云开发已初始化完成");
    }

    // 2. 检查网络状态
    wx.getNetworkType({
      success: (res) => {
        console.log("当前网络类型:", res.networkType);
      }
    });
  },

  globalData: {
    // 您的微信云开发静态托管网址（通过 tcb hosting deploy 部署后生效）
    webUrl: "https://cloud-d3gbi9e14940c4306.tcloudbaseapp.com",
    userInfo: null,
    pairId: null
  }
});

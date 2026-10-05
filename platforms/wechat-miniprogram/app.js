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
    // 生产环境可配置为您部署的 Web 应用公网域名或云托管网址
    // 在开发测试阶段，可以使用本项目的云端预览网址
    webUrl: "https://ais-dev-k23oepuroewhqaouogbmfv-357208839505.asia-northeast1.run.app",
    userInfo: null,
    pairId: null
  }
});

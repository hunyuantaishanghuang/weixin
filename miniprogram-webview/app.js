// app.js - 微信小程序入口
App({
  onLaunch() {
    console.log("我们的小日子小程序启动");
    
    // 初始化微信云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: "cloud-d3gbi9e14940c4306",
        traceUser: true
      });
      console.log("微信云开发初始化成功: cloud-d3gbi9e14940c4306");
    }
  },
  globalData: {
    // 您的微信云开发静态托管真实分配网址
    webUrl: "https://cloud-d3gbi9e14940c4306-1382829378.tcloudbaseapp.com",
    userInfo: null,
    openid: null
  }
});

// 前端请求封装（云开发版）：内部用 wx.cloud.callFunction
// 调用形式：api.call(name, data) -> 返回云函数 res（含 result 字段）
//            api.upload(filePath) -> 返回 { url: fileID }

function getOpenid() {
  return getApp().globalData.openid || "";
}

// 统一调用云函数：name = 'pair' | 'dataOps' | 'ai'
function call(name, data) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data: data || {},
      success: (res) => resolve(res),
      fail: reject,
    });
  });
}

// 云存储上传，返回 { url: fileID }
function upload(filePath) {
  const ext = (filePath.match(/\.\w+$/) || [".png"])[0];
  const cloudPath = `uploads/${Date.now()}-${Math.floor(Math.random() * 1e6)}${ext}`;
  return new Promise((resolve, reject) => {
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: (res) => resolve({ fileID: res.fileID, url: res.fileID }),
      fail: reject,
    });
  });
}

module.exports = { call, upload, getOpenid };

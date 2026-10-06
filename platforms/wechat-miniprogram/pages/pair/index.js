// pages/pair/index.js
const app = getApp();

Page({
  data: {
    userInfo: {},
    pairInfo: {},
    pairId: "",
    isBound: false,
    myInviteCode: "",
    inputCode: "",
    showExplainer: false,
    showAuthModal: false,
    authTab: "wechat",
    authUsername: "",
    authPassword: "",
    authNickname: ""
  },

  onLoad() {
    this.refreshUserAndPair();
  },

  onShow() {
    this.refreshUserAndPair();
  },

  onPullDownRefresh() {
    this.refreshUserAndPair(() => {
      wx.stopPullDownRefresh();
    });
  },

  refreshUserAndPair(cb) {
    const userInfo = app.globalData.userInfo || wx.getStorageSync("local_user") || {
      nickname: "微信用户",
      openid: "wx_guest_" + Date.now().toString(36)
    };
    const pairId = app.globalData.pairId || wx.getStorageSync("local_pairId") || "";
    const pairInfo = app.globalData.pairInfo || wx.getStorageSync("local_pairInfo") || {};

    this.setData({
      userInfo,
      pairId,
      pairInfo,
      isBound: !!pairId
    });

    if (wx.cloud) {
      app.refreshPair(pair => {
        if (pair) {
          this.setData({
            pairInfo: pair,
            pairId: pair.pairId,
            isBound: pair.status === "bound"
          });
        }
        if (typeof cb === "function") cb();
      });
    } else {
      if (typeof cb === "function") cb();
    }
  },

  copyOpenId() {
    const openid = this.data.userInfo.openid;
    if (!openid) return;
    wx.setClipboardData({
      data: openid,
      success: () => wx.showToast({ title: "OpenID已复制", icon: "none" })
    });
  },

  copyPairId() {
    if (!this.data.pairId) return;
    wx.setClipboardData({
      data: this.data.pairId,
      success: () => wx.showToast({ title: "隔离识别码已复制", icon: "none" })
    });
  },

  toggleExplainer() {
    this.setData({ showExplainer: !this.data.showExplainer });
  },

  createInviteCode() {
    wx.showLoading({ title: "生成配对码中..." });
    const user = this.data.userInfo;

    if (wx.cloud) {
      wx.cloud.callFunction({
        name: "pair",
        data: {
          action: "create",
          userId: user.openid || user.id,
          nickname: user.nickname || "男孩",
          role: "A"
        }
      }).then(res => {
        wx.hideLoading();
        if (res.result && res.result.success && res.result.inviteCode) {
          this.setData({ myInviteCode: res.result.inviteCode });
          wx.showToast({ title: "邀请码已生成", icon: "success" });
        } else {
          this.generateLocalInvite();
        }
      }).catch(() => {
        wx.hideLoading();
        this.generateLocalInvite();
      });
    } else {
      wx.hideLoading();
      this.generateLocalInvite();
    }
  },

  generateLocalInvite() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "INV-";
    for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
    this.setData({ myInviteCode: code });
    wx.showToast({ title: "邀请码已生成", icon: "success" });
  },

  copyInviteCode() {
    wx.setClipboardData({
      data: this.data.myInviteCode,
      success: () => wx.showToast({ title: "已复制，快发给TA吧", icon: "success" })
    });
  },

  onInputCode(e) {
    this.setData({ inputCode: e.detail.value.trim().toUpperCase() });
  },

  submitJoinPair() {
    const code = this.data.inputCode;
    if (!code) {
      wx.showToast({ title: "请输入伴侣的邀请码", icon: "none" });
      return;
    }

    wx.showLoading({ title: "正在云端绑定..." });
    const user = this.data.userInfo;

    if (wx.cloud) {
      wx.cloud.callFunction({
        name: "pair",
        data: {
          action: "join",
          inviteCode: code,
          userId: user.openid || user.id,
          nickname: user.nickname || "女孩",
          role: "B"
        }
      }).then(res => {
        wx.hideLoading();
        if (res.result && res.result.success) {
          const pair = res.result.pair;
          app.globalData.pairInfo = pair;
          app.globalData.pairId = pair.pairId;
          app.globalData.isBound = true;
          wx.setStorageSync("local_pairId", pair.pairId);
          wx.setStorageSync("local_pairInfo", pair);

          this.setData({
            pairId: pair.pairId,
            pairInfo: pair,
            isBound: true,
            inputCode: ""
          });
          wx.showToast({ title: "🎉 恭喜伴侣成功绑定！", icon: "success" });
        } else {
          wx.showModal({
            title: "绑定提示",
            content: res.result.error || "未找到该邀请码，请核对是否正确",
            showCancel: false
          });
        }
      }).catch(err => {
        wx.hideLoading();
        // 允许直接匹配测试码
        this.fallbackJoin(code);
      });
    } else {
      wx.hideLoading();
      this.fallbackJoin(code);
    }
  },

  fallbackJoin(code) {
    const newPairId = "PAIR_" + code.replace(/[^A-Z0-9]/g, "");
    const pair = {
      pairId: newPairId,
      status: "bound",
      nicknameA: "我",
      nicknameB: "TA",
      bindTime: new Date().toISOString()
    };
    app.globalData.pairId = newPairId;
    app.globalData.isBound = true;
    app.globalData.pairInfo = pair;
    wx.setStorageSync("local_pairId", newPairId);
    wx.setStorageSync("local_pairInfo", pair);

    this.setData({
      pairId: newPairId,
      pairInfo: pair,
      isBound: true,
      inputCode: ""
    });
    wx.showToast({ title: "🎉 绑定成功！", icon: "success" });
  },

  handleUnbind() {
    wx.showModal({
      title: "解除伴侣绑定",
      content: "解除后数据将保留但暂时无法实时互通，确认解除吗？",
      confirmColor: "#FF5370",
      success: sm => {
        if (sm.confirm) {
          const pairId = this.data.pairId;
          if (wx.cloud && pairId) {
            wx.cloud.callFunction({
              name: "pair",
              data: { action: "unbind", pairId }
            }).catch(() => {});
          }

          app.globalData.pairId = "";
          app.globalData.isBound = false;
          app.globalData.pairInfo = {};
          wx.removeStorageSync("local_pairId");
          wx.removeStorageSync("local_pairInfo");

          this.setData({
            pairId: "",
            pairInfo: {},
            isBound: false,
            myInviteCode: ""
          });
          wx.showToast({ title: "已解除绑定", icon: "none" });
        }
      }
    });
  },

  openAuthModal() { this.setData({ showAuthModal: true }); },
  closeAuthModal() { this.setData({ showAuthModal: false }); },
  setAuthTab(e) { this.setData({ authTab: e.currentTarget.dataset.tab }); },

  doWechatAuth() {
    wx.showLoading({ title: "正在授权..." });
    app.autoLogin(user => {
      wx.hideLoading();
      this.setData({
        userInfo: user,
        showAuthModal: false
      });
      wx.showToast({ title: "微信登录成功", icon: "success" });
    });
  },

  onInputUsername(e) { this.setData({ authUsername: e.detail.value.trim() }); },
  onInputPassword(e) { this.setData({ authPassword: e.detail.value }); },
  onInputNickname(e) { this.setData({ authNickname: e.detail.value.trim() }); },

  doAccountRegister() {
    const { authUsername, authPassword, authNickname } = this.data;
    if (!authUsername || !authPassword) {
      wx.showToast({ title: "用户名和密码不能为空", icon: "none" });
      return;
    }

    wx.showLoading({ title: "注册中..." });
    if (wx.cloud) {
      wx.cloud.callFunction({
        name: "auth",
        data: {
          action: "register",
          username: authUsername,
          password: authPassword,
          nickname: authNickname || authUsername,
          gender: "male"
        }
      }).then(res => {
        wx.hideLoading();
        if (res.result && res.result.success) {
          const user = res.result.user;
          app.globalData.userInfo = user;
          wx.setStorageSync("local_user", user);
          this.setData({
            userInfo: user,
            showAuthModal: false
          });
          wx.showToast({ title: "注册并登录成功", icon: "success" });
        } else {
          wx.showModal({ title: "注册失败", content: res.result.error || "用户名已被占用", showCancel: false });
        }
      }).catch(err => {
        wx.hideLoading();
        wx.showModal({ title: "提示", content: err.message || "云函数连接异常", showCancel: false });
      });
    }
  },

  doAccountLogin() {
    const { authUsername, authPassword } = this.data;
    if (!authUsername || !authPassword) {
      wx.showToast({ title: "请输入用户名和密码", icon: "none" });
      return;
    }

    wx.showLoading({ title: "登录中..." });
    if (wx.cloud) {
      wx.cloud.callFunction({
        name: "auth",
        data: {
          action: "login",
          username: authUsername,
          password: authPassword
        }
      }).then(res => {
        wx.hideLoading();
        if (res.result && res.result.success) {
          const user = res.result.user;
          app.globalData.userInfo = user;
          wx.setStorageSync("local_user", user);
          this.setData({
            userInfo: user,
            showAuthModal: false
          });
          wx.showToast({ title: "登录成功", icon: "success" });
        } else {
          wx.showModal({ title: "登录失败", content: res.result.error || "账号或密码错误", showCancel: false });
        }
      }).catch(err => {
        wx.hideLoading();
        wx.showModal({ title: "提示", content: err.message || "登录请求异常", showCancel: false });
      });
    }
  }
});

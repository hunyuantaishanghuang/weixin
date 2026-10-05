const app = getApp();
const api = require("../../api");

Page({
  data: {
    step: "loading", // loading | unbound | created | joining | pending | bound
    code: "",
    inputCode: "",
    isCreator: false,
    hasPending: false,
    role: "",
    timer: null,
  },
  onLoad() {
    this.refresh();
  },
  onUnload() {
    this.clearTimer();
  },
  clearTimer() {
    if (this.data.timer) {
      clearInterval(this.data.timer);
      this.setData({ timer: null });
    }
  },
  refresh() {
    const app = getApp();
    const pairId = app.globalData.pairId;
    if (pairId) {
      this.pollStatus(pairId, true);
    } else {
      this.setData({ step: "unbound" });
    }
  },
  // 创建配对
  onCreate() {
    wx.showLoading({ title: "生成中" });
    api.call("pair", { type: "createPair" }).then((res) => {
      wx.hideLoading();
      if (res.result.success) {
        app.globalData.pairId = res.result.pairId;
        app.globalData.userInfo = { role: "A" };
        this.setData({ step: "created", code: res.result.pairId, isCreator: true });
        this.startTimer(res.result.pairId);
      } else {
        wx.showToast({ title: res.result.msg || "失败", icon: "none" });
      }
    });
  },
  // 输入识别码加入
  onInput(e) {
    this.setData({ inputCode: e.detail.value.toUpperCase() });
  },
  onJoin() {
    const code = this.data.inputCode.trim().toUpperCase();
    if (code.length !== 6) {
      wx.showToast({ title: "请输入6位识别码", icon: "none" });
      return;
    }
    wx.showLoading({ title: "提交中" });
    api.call("pair", { type: "joinPair", code }).then((res) => {
      wx.hideLoading();
      if (res.result.success) {
        app.globalData.pairId = code;
        this.setData({ step: "joining", code });
        this.startTimer(code);
      } else {
        wx.showToast({ title: res.result.msg || "失败", icon: "none" });
      }
    });
  },
  // 发起方确认绑定
  onConfirm() {
    wx.showLoading({ title: "确认中" });
    api.call("pair", { type: "confirmBind", code: this.data.code }).then((res) => {
      wx.hideLoading();
      if (res.result.success) {
        this.onBound();
      } else {
        wx.showToast({ title: res.result.msg || "失败", icon: "none" });
      }
    });
  },
  // 轮询状态
  pollStatus(code, immediate) {
    api.call("pair", { type: "getPairStatus", code }).then((res) => {
      if (!res.result.success) {
        this.setData({ step: "unbound" });
        app.globalData.pairId = "";
        return;
      }
      const { status, isCreator, hasPending } = res.result;
      if (status === "bound") {
        this.onBound();
      } else if (status === "pending" && isCreator) {
        this.setData({ step: "pending", code, isCreator, hasPending });
        if (immediate) this.startTimer(code);
      } else if (status === "pending" && !isCreator) {
        this.setData({ step: "joining", code });
        if (immediate) this.startTimer(code);
      } else {
        this.setData({ step: isCreator ? "created" : "joining", code, isCreator });
        if (immediate) this.startTimer(code);
      }
    });
  },
  startTimer(code) {
    this.clearTimer();
    const t = setInterval(() => this.pollStatus(code, false), 2000);
    this.setData({ timer: t });
  },
  onBound() {
    this.clearTimer();
    app.globalData.pairId = this.data.code;
    this.setData({ step: "bound", code: this.data.code });
    wx.showToast({ title: "绑定成功！", icon: "success" });
  },
  onUnbind() {
    wx.showModal({
      title: "解除绑定",
      content: "解除后双方数据将不再关联，确定吗？",
      success: (r) => {
        if (!r.confirm) return;
        api.call("pair", { type: "unbind" }).then(() => {
          app.globalData.pairId = "";
          app.globalData.userInfo = null;
          this.setData({ step: "unbound", code: "", inputCode: "" });
        });
      },
    });
  },
  copyCode() {
    wx.setClipboardData({ data: this.data.code });
  },
});

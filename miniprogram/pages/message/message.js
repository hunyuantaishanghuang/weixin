const app = getApp();
const api = require("../../api");

// 留言模块：数据以 pairId 隔离，结构预留 for App/桌面组件扩展
// 字段：pairId, fromRole(角色A/B), toRole, content, type(text/voice/image), read, createTime
Page({
  data: {
    messages: [],
    input: "",
    sending: false,
  },
  onShow() {
    if (!app.globalData.pairId) return;
    this.load();
  },
  load() {
    api.call("dataOps", { collection: "messages", action: "list" }).then((res) => {
      if (res.result.success) {
        const role = (app.globalData.userInfo && app.globalData.userInfo.role) || "A";
        const list = res.result.list.map((m) => ({
          _id: m.id,
          content: m.content,
          mine: m.fromRole === role,
          date: this.fmt(new Date(m.createTime)),
        }));
        this.setData({ messages: list });
      }
    });
  },
  onInput(e) { this.setData({ input: e.detail.value }); },
  async send() {
    const content = this.input.trim();
    if (!content || this.data.sending) return;
    this.setData({ sending: true });
    const role = (app.globalData.userInfo && app.globalData.userInfo.role) || "A";
    await api.call("dataOps", {
      collection: "messages",
      action: "add",
      data: { fromRole: role, toRole: role === "A" ? "B" : "A", content, type: "text", read: false },
    });
    this.setData({ input: "", sending: false });
    this.load();
  },
  // 预留：一键生成情话（调用 AI 接口）
  async genLove() {
    const res = await api.call("ai", { type: "genLove" });
    if (res.result.success && res.result.text) {
      this.setData({ input: res.result.text });
    }
  },
  fmt(d) {
    const h = `${d.getHours()}`.padStart(2, "0");
    const min = `${d.getMinutes()}`.padStart(2, "0");
    return `${h}:${min}`;
  },
});

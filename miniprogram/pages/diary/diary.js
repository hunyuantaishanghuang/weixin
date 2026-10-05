const app = getApp();
const api = require("../../api");

const MOODS = [
  { key: "happy", icon: "😊", label: "开心" },
  { key: "sad", icon: "😢", label: "难过" },
  { key: "angry", icon: "😠", label: "生气" },
  { key: "calm", icon: "😌", label: "平静" },
  { key: "tired", icon: "😩", label: "疲惫" },
  { key: "love", icon: "🥰", label: "甜蜜" },
];

Page({
  data: {
    moods: MOODS,
    diaries: [],
    showAdd: false,
    form: { mood: "happy", text: "", images: [] },
  },
  onShow() {
    if (!app.globalData.pairId) return;
    this.load();
  },
  load() {
    api.call("dataOps", { collection: "diaries", action: "list" }).then((res) => {
      if (res.result.success) {
        const list = res.result.list.map((d) => ({
          _id: d.id,
          mood: MOODS.find((m) => m.key === d.mood) || MOODS[0],
          text: d.text,
          images: d.images || [],
          date: this.fmt(new Date(d.createTime)),
        }));
        this.setData({ diaries: list });
      }
    });
  },
  openAdd() {
    this.setData({ showAdd: true, form: { mood: "happy", text: "", images: [] } });
  },
  closeAdd() { this.setData({ showAdd: false }); },
  pickMood(e) { this.setData({ "form.mood": e.currentTarget.dataset.key }); },
  onText(e) { this.setData({ "form.text": e.detail.value }); },
  uploadImages() {
    wx.chooseMedia({
      count: 9,
      mediaType: ["image"],
      success: async (r) => {
        wx.showLoading({ title: "上传中" });
        const urls = [];
        for (const f of r.tempFiles) {
          const up = await api.upload(f.tempFilePath);
          urls.push(up.url);
        }
        this.setData({ "form.images": this.data.form.images.concat(urls) });
        wx.hideLoading();
      },
    });
  },
  removeImg(e) {
    const idx = e.currentTarget.dataset.idx;
    const imgs = this.data.form.images.slice();
    imgs.splice(idx, 1);
    this.setData({ "form.images": imgs });
  },
  submit() {
    const f = this.data.form;
    if (!f.text.trim() && !f.images.length) {
      wx.showToast({ title: "写点什么或加张图吧", icon: "none" });
      return;
    }
    api.call("dataOps", {
      collection: "diaries", action: "add",
      data: { mood: f.mood, text: f.text, images: f.images },
    }).then(() => {
      this.setData({ showAdd: false });
      this.load();
    });
  },
  remove(e) {
    const id = e.currentTarget.dataset.id;
    api.call("dataOps", { collection: "diaries", action: "remove", _id: id }).then(() => this.load());
  },
  fmt(d) {
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    const h = `${d.getHours()}`.padStart(2, "0");
    const min = `${d.getMinutes()}`.padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day} ${h}:${min}`;
  },
  noop() {},
});

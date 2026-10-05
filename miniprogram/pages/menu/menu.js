const app = getApp();
const api = require("../../api");

Page({
  data: {
    tab: "cook",
    dishes: [],
    orders: [],
    showAdd: false,
    form: { name: "", materials: "", image: "", note: "" },
    parsing: false,
    pastedText: "",
    todayKey: "",
  },
  onShow() {
    if (!app.globalData.pairId) return;
    this.loadDishes();
    this.loadOrders();
  },
  switchTab(e) {
    this.setData({ tab: e.currentTarget.dataset.tab });
  },
  loadDishes() {
    api.call("dataOps", { collection: "dishes", action: "list" }).then((res) => {
      if (res.result.success) this.setData({ dishes: res.result.list });
    });
  },
  loadOrders() {
    api.call("dataOps", { collection: "menus", action: "list" }).then((res) => {
      if (res.result.success) {
        const today = this.dateKey(new Date());
        const orders = res.result.list.filter((o) => o.dateKey === today);
        this.setData({ orders, todayKey: today });
      }
    });
  },
  openAdd() {
    this.setData({ showAdd: true, form: { name: "", materials: "", image: "", note: "" }, pastedText: "" });
  },
  closeAdd() { this.setData({ showAdd: false }); },
  onName(e) { this.setData({ "form.name": e.detail.value }); },
  onMaterials(e) { this.setData({ "form.materials": e.detail.value }); },
  onNote(e) { this.setData({ "form.note": e.detail.value }); },
  uploadImage() {
    wx.chooseMedia({
      count: 1, mediaType: ["image"],
      success: (r) => {
        const file = r.tempFiles[0].tempFilePath;
        wx.showLoading({ title: "上传中" });
        api.upload(file).then((up) => {
          this.setData({ "form.image": up.url });
          wx.hideLoading();
        }).catch(() => wx.hideLoading());
      },
    });
  },
  onPasteInput(e) { this.setData({ pastedText: e.detail.value }); },
  async parsePaste() {
    const text = this.data.pastedText.trim();
    if (!text) { wx.showToast({ title: "请粘贴菜品文本或链接", icon: "none" }); return; }
    this.setData({ parsing: true });
    const res = await api.call("ai", { type: "parseDishes", text });
    this.setData({ parsing: false });
    if (res.result.success && res.result.dishes.length) {
      const tasks = res.result.dishes.map((d) =>
        api.call("dataOps", {
          collection: "dishes", action: "add",
          data: { name: d.name, materials: d.materials || [], note: d.note || "", image: "" },
        })
      );
      await Promise.all(tasks);
      wx.showToast({ title: `识别并添加${res.result.dishes.length}道菜`, icon: "success" });
      this.setData({ pastedText: "" });
      this.loadDishes();
    } else {
      wx.showToast({ title: "未能识别到菜品", icon: "none" });
    }
  },
  submitDish() {
    const f = this.data.form;
    if (!f.name.trim()) { wx.showToast({ title: "请输入菜名", icon: "none" }); return; }
    const materials = f.materials.split(/[，,\n]/).map((s) => s.trim()).filter(Boolean);
    api.call("dataOps", {
      collection: "dishes", action: "add",
      data: { name: f.name, materials, note: f.note, image: f.image },
    }).then(() => { this.setData({ showAdd: false }); this.loadDishes(); });
  },
  orderDish(e) {
    const dish = e.currentTarget.dataset.dish;
    api.call("dataOps", {
      collection: "menus", action: "add",
      data: {
        dishId: dish.id, name: dish.name, materials: dish.materials,
        image: dish.image, note: dish.note, dateKey: this.data.todayKey, done: false,
      },
    }).then(() => { wx.showToast({ title: "已点给TA", icon: "success" }); this.loadOrders(); });
  },
  toggleDone(e) {
    const o = e.currentTarget.dataset.o;
    api.call("dataOps", {
      collection: "menus", action: "update", _id: o.id, data: { done: !o.done },
    }).then(() => this.loadOrders());
  },
  removeOrder(e) {
    const id = e.currentTarget.dataset.id;
    api.call("dataOps", { collection: "menus", action: "remove", _id: id }).then(() => this.loadOrders());
  },
  dateKey(d) { return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; },
  noop() {},
});

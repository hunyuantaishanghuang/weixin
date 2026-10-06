// pages/menu/index.js
const app = getApp();

const DEFAULT_DISHES = [
  { id: "d1", name: "番茄炒蛋", materialsStr: "番茄、土鸡蛋、小葱", note: "酸甜多汁，多留点汤汁拌饭超香" },
  { id: "d2", name: "秘制可乐鸡翅", materialsStr: "鸡中翅、可口可乐、生姜、料酒", note: "两面金黄后小火收汁，浓郁入味" },
  { id: "d3", name: "蒜蓉西兰花", materialsStr: "西兰花、大蒜、生抽、蚝油", note: "焯水过凉水保持爽脆清甜" },
  { id: "d4", name: "暖胃冬阴功鲜虾汤", materialsStr: "鲜活基围虾、口蘑、柠檬、香茅", note: "酸辣开胃，喝一碗暖到心坎里" }
];

Page({
  data: {
    orders: [
      { id: "o1", name: "秘制可乐鸡翅", done: false }
    ],
    dishes: DEFAULT_DISHES,
    showModal: false,
    newDishName: "",
    newDishMaterials: "",
    newDishNote: ""
  },

  onLoad() {
    this.loadMenuData();
  },

  onShow() {
    this.loadMenuData();
  },

  onPullDownRefresh() {
    this.loadMenuData(() => {
      wx.stopPullDownRefresh();
    });
  },

  loadMenuData(cb) {
    const pairId = app.globalData.pairId || wx.getStorageSync("local_pairId") || "";

    // 优先读取本地
    const localDishes = wx.getStorageSync("local_dishes");
    const localOrders = wx.getStorageSync("local_orders");
    if (localDishes) this.setData({ dishes: localDishes });
    if (localOrders) this.setData({ orders: localOrders });

    // 云端同步（严格按 pairId 隔离）
    if (wx.cloud && pairId) {
      app.callCloud("dataOps", {
        type: "dishes",
        action: "get",
        pairId
      }).then(res => {
        if (res && res.list && res.list.length > 0) {
          const list = res.list.map(d => ({
            ...d,
            materialsStr: Array.isArray(d.materials) ? d.materials.join("、") : (d.materialsStr || "")
          }));
          this.setData({ dishes: list });
          wx.setStorageSync("local_dishes", list);
        }
      }).catch(() => {});

      app.callCloud("dataOps", {
        type: "orders",
        action: "get",
        pairId
      }).then(res => {
        if (res && res.list) {
          this.setData({ orders: res.list });
          wx.setStorageSync("local_orders", res.list);
        }
      }).catch(() => {}).finally(() => {
        if (typeof cb === "function") cb();
      });
    } else {
      if (typeof cb === "function") cb();
    }
  },

  orderDish(e) {
    const item = e.currentTarget.dataset.item;
    const pairId = app.globalData.pairId || wx.getStorageSync("local_pairId") || "";
    const newOrder = {
      id: "ord_" + Date.now(),
      name: item.name,
      done: false,
      pairId,
      createTime: new Date().toISOString()
    };

    const orders = [newOrder, ...this.data.orders];
    this.setData({ orders });
    wx.setStorageSync("local_orders", orders);

    wx.vibrateShort({ type: 'light' });
    wx.showToast({ title: `已点「${item.name}」`, icon: "success" });

    // 云端保存
    if (wx.cloud && pairId) {
      app.callCloud("dataOps", {
        type: "orders",
        action: "add",
        pairId,
        data: newOrder
      }).catch(() => {});
    }
  },

  toggleOrder(e) {
    const id = e.currentTarget.dataset.id;
    const orders = this.data.orders.map(o => {
      if (o.id === id || o._id === id) {
        return { ...o, done: !o.done };
      }
      return o;
    });
    this.setData({ orders });
    wx.setStorageSync("local_orders", orders);
    wx.vibrateShort({ type: 'light' });

    const pairId = app.globalData.pairId || "";
    if (wx.cloud && pairId) {
      app.callCloud("dataOps", {
        type: "orders",
        action: "toggle",
        pairId,
        id
      }).catch(() => {});
    }
  },

  removeOrder(e) {
    const id = e.currentTarget.dataset.id;
    const orders = this.data.orders.filter(o => o.id !== id && o._id !== id);
    this.setData({ orders });
    wx.setStorageSync("local_orders", orders);

    const pairId = app.globalData.pairId || "";
    if (wx.cloud && pairId) {
      app.callCloud("dataOps", {
        type: "orders",
        action: "delete",
        pairId,
        id
      }).catch(() => {});
    }
  },

  openAddModal() {
    this.setData({ showModal: true });
  },

  closeAddModal() {
    this.setData({ showModal: false });
  },

  onInputName(e) { this.setData({ newDishName: e.detail.value }); },
  onInputMaterials(e) { this.setData({ newDishMaterials: e.detail.value }); },
  onInputNote(e) { this.setData({ newDishNote: e.detail.value }); },

  submitNewDish() {
    const name = this.data.newDishName.trim();
    if (!name) {
      wx.showToast({ title: "请输入菜品名称", icon: "none" });
      return;
    }

    const pairId = app.globalData.pairId || "";
    const newDish = {
      id: "dish_" + Date.now(),
      name,
      materialsStr: this.data.newDishMaterials.trim() || "自备食材",
      note: this.data.newDishNote.trim(),
      pairId,
      createTime: new Date().toISOString()
    };

    const dishes = [...this.data.dishes, newDish];
    this.setData({
      dishes,
      showModal: false,
      newDishName: "",
      newDishMaterials: "",
      newDishNote: ""
    });
    wx.setStorageSync("local_dishes", dishes);
    wx.showToast({ title: "菜谱已入库", icon: "success" });

    if (wx.cloud && pairId) {
      app.callCloud("dataOps", {
        type: "dishes",
        action: "add",
        pairId,
        data: newDish
      }).catch(() => {});
    }
  }
});

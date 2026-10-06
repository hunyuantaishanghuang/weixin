// pages/home/index.js
const app = getApp();

Page({
  data: {
    greeting: "下午好",
    daysTogether: 30,
    isBound: false,
    pairId: "",
    pairInfo: {},
    distanceKm: "12.5",
    distanceDesc: "同城同呼吸，正在奔向你",
    locA: "南山区科技园",
    locB: "福田区CBD星巴克",
    pendingOrdersCount: 0,
    periodDays: 10
  },

  onLoad() {
    this.updateGreeting();
    this.loadData();
  },

  onShow() {
    this.updateGreeting();
    this.loadData();
  },

  onPullDownRefresh() {
    app.autoLogin(() => {
      this.loadData();
      wx.stopPullDownRefresh();
    });
  },

  updateGreeting() {
    const hour = new Date().getHours();
    let greeting = "今日好";
    if (hour >= 5 && hour < 11) greeting = "早安";
    else if (hour >= 11 && hour < 13) greeting = "中午好";
    else if (hour >= 13 && hour < 18) greeting = "下午好";
    else greeting = "晚上好";
    this.setData({ greeting });
  },

  loadData() {
    const pairId = app.globalData.pairId || wx.getStorageSync("local_pairId") || "";
    const pairInfo = app.globalData.pairInfo || wx.getStorageSync("local_pairInfo") || {
      nicknameA: "男孩",
      nicknameB: "女孩"
    };

    let daysTogether = 30;
    const baseDate = pairInfo.anniversaryDate || pairInfo.bindTime || pairInfo.createTime;
    if (baseDate) {
      const startTime = new Date(baseDate).getTime();
      const diff = Date.now() - startTime;
      if (!isNaN(diff) && diff > 0) {
        daysTogether = Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
      }
    }

    this.setData({
      pairId,
      isBound: !!pairId && (pairInfo.status === "bound" || !!pairInfo.memberB),
      pairInfo,
      daysTogether
    });

    // 读取本地订单
    const localOrders = wx.getStorageSync("local_orders") || [];
    const pendingLocal = localOrders.filter(item => !item.done).length;
    this.setData({ pendingOrdersCount: pendingLocal });

    // 云端同步
    if (wx.cloud && pairId) {
      app.callCloud("dataOps", {
        type: "orders",
        action: "get",
        pairId
      }).then(res => {
        if (res && res.list) {
          const pending = res.list.filter(item => !item.done).length;
          this.setData({ pendingOrdersCount: pending });
        }
      }).catch(() => {});

      // 拉取双人实时距离
      app.callCloud("dataOps", {
        action: "getLocation",
        pairId
      }).then(res => {
        if (res && res.success) {
          if (res.distanceKm) {
            this.setData({
              distanceKm: res.distanceKm,
              distanceDesc: parseFloat(res.distanceKm) < 1 ? "近在咫尺，心跳同频 💕" : "同城同呼吸，正在奔向你"
            });
          }
          if (res.locationA && res.locationA.address) {
            this.setData({ locA: res.locationA.address });
          }
          if (res.locationB && res.locationB.address) {
            this.setData({ locB: res.locationB.address });
          }
        }
      }).catch(() => {});
    }
  },

  sendPoke(e) {
    const type = e.currentTarget.dataset.type;
    const map = {
      hug: "🫂 送出了一个暖烘烘的超大熊抱！",
      tea: "🧋 投喂了一杯全糖多加波霸奶茶！",
      kiss: "💋 送出了一个甜蜜暴击飞吻！",
      rub: "💆 温柔摸了摸TA的小脑袋，辛苦啦！"
    };
    wx.vibrateShort({ type: 'medium' });
    wx.showToast({
      title: map[type] || "互动成功",
      icon: "none",
      duration: 2000
    });

    const pairId = this.data.pairId;
    if (wx.cloud && pairId) {
      app.callCloud("dataOps", {
        type: "pokes",
        action: "add",
        pairId,
        data: {
          type,
          label: map[type],
          time: new Date().toISOString()
        }
      }).catch(() => {});
    }
  },

  goToPair() {
    wx.switchTab({ url: "/pages/pair/index" });
  },

  goToMenu() {
    wx.switchTab({ url: "/pages/menu/index" });
  },

  goToCalendar() {
    wx.switchTab({ url: "/pages/calendar/index" });
  },

  goToAdventure() {
    wx.switchTab({ url: "/pages/adventure/index" });
  },

  goToPeriod() {
    wx.showModal({
      title: "经期温柔推算",
      content: "预计还有 10 天进入生理期，请备好红糖姜茶与暖宝宝贴心呵护~",
      showCancel: false,
      confirmText: "收到啦",
      confirmColor: "#FF5370"
    });
  }
});

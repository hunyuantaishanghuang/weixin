const app = getApp();

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return "夜深了";
  if (h < 11) return "早上好";
  if (h < 14) return "中午好";
  if (h < 18) return "下午好";
  return "晚上好";
}

Page({
  data: {
    pairId: "",
    bound: false,
    greet: "你好",
    menus: [
      { icon: "🍳", name: "今日点菜", desc: "想吃的，点给TA看", page: "/pages/menu/menu", bg: "linear-gradient(135deg,#FFD3A5,#FD6585)" },
      { icon: "🌸", name: "经期记录", desc: "温柔记录，贴心提醒", page: "/pages/period/period", bg: "linear-gradient(135deg,#FF9A9E,#FECFEF)" },
      { icon: "💭", name: "心情日记", desc: "记下每天的小心情", page: "/pages/diary/diary", bg: "linear-gradient(135deg,#A18CD1,#FBC2EB)" },
      { icon: "💌", name: "悄悄话", desc: "给TA留句暖心话", page: "/pages/message/message", bg: "linear-gradient(135deg,#84FAB0,#8FD3F4)" },
    ],
  },
  onShow() {
    this.setData({
      pairId: app.globalData.pairId,
      bound: !!app.globalData.pairId,
      greet: greeting(),
    });
  },
  goPair() {
    wx.navigateTo({ url: "/pages/pair/pair" });
  },
  goPage(e) {
    const page = e.currentTarget.dataset.page;
    if (!this.data.bound) {
      wx.showModal({
        title: "提示",
        content: "请先与伴侣完成绑定，再使用功能哦~",
        confirmText: "去绑定",
        success: (r) => {
          if (r.confirm) wx.navigateTo({ url: "/pages/pair/pair" });
        },
      });
      return;
    }
    wx.navigateTo({ url: page });
  },
});

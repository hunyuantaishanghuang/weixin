// pages/adventure/index.js
const app = getApp();

const PRESET_CARDS = [
  { id: "adv_1", category: "sweet", text: "看着TA的眼睛对视30秒，期间谁先笑出来谁就要给对方揉揉肩", tip: "深情对视，不许移开目光哦", completed: true },
  { id: "adv_2", category: "sweet", text: "说出对方身上最吸引你的3个闪光点，并认真解释原因", tip: "真诚走心，不许敷衍", completed: false },
  { id: "adv_3", category: "sweet", text: "给对方一个持续至少20秒的无声紧紧拥抱", tip: "感受彼此的心跳与温度", completed: false },
  { id: "adv_4", category: "fun", text: "模仿对方生气时的口头禅和表情动作，让对方评判像不像", tip: "搞笑不许人身攻击哈哈", completed: false },
  { id: "adv_5", category: "fun", text: "用撒娇的语气说三句夸奖对方的话", tip: "必须带上甜甜的叠字", completed: false },
  { id: "adv_6", category: "deep", text: "聊聊过去这一年里，对方做的哪件事让你最有安全感", tip: "说出心底最温暖的瞬间", completed: false },
  { id: "adv_7", category: "deep", text: "如果给我们的未来生活画一幅画，你脑海里最先出现什么画面？", tip: "描绘属于两个人的美好蓝图", completed: false },
  { id: "adv_8", category: "heartbeat", text: "轻轻吻一下对方的额头，并说一句专属情话", tip: "温柔而郑重", completed: false },
  { id: "adv_9", category: "heartbeat", text: "牵着对方的手，十指紧扣漫步或者静静待两分钟", tip: "享受只属于彼此的静谧", completed: false }
];

Page({
  data: {
    categories: [
      { key: "sweet", name: "甜蜜互动", icon: "🍬" },
      { key: "fun", name: "趣味整蛊", icon: "🤪" },
      { key: "deep", name: "默契心声", icon: "💬" },
      { key: "heartbeat", name: "浪漫心跳", icon: "💓" }
    ],
    currentCategory: "sweet",
    activeCatName: "甜蜜互动",
    currentCategoryIcon: "🍬",
    cards: PRESET_CARDS,
    currentCard: PRESET_CARDS[0],
    completedCount: 1
  },

  onLoad() {
    this.loadCards();
  },

  onShow() {
    this.loadCards();
  },

  loadCards() {
    const pairId = app.globalData.pairId || "";
    const local = wx.getStorageSync("local_adventures");
    if (local && local.length > 0) {
      this.setData({ cards: local });
      this.pickCardForCategory(this.data.currentCategory, local);
    } else {
      this.setData({ cards: PRESET_CARDS });
      this.pickCardForCategory(this.data.currentCategory, PRESET_CARDS);
    }
  },

  changeCategory(e) {
    const key = e.currentTarget.dataset.key;
    const cat = this.data.categories.find(c => c.key === key) || this.data.categories[0];
    this.setData({
      currentCategory: key,
      activeCatName: cat.name,
      currentCategoryIcon: cat.icon
    });
    this.pickCardForCategory(key, this.data.cards);
  },

  pickCardForCategory(catKey, list) {
    const filtered = list.filter(c => c.category === catKey);
    const card = filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : list[0];
    const completedCount = list.filter(c => c.completed).length;
    this.setData({
      currentCard: card,
      completedCount
    });
  },

  drawRandomCard() {
    wx.vibrateShort({ type: 'medium' });
    this.pickCardForCategory(this.data.currentCategory, this.data.cards);
    wx.showToast({ title: "已随机抽选新挑战 🎲", icon: "none" });
  },

  toggleComplete() {
    const curr = this.data.currentCard;
    const nextVal = !curr.completed;
    const cards = this.data.cards.map(c => {
      if (c.id === curr.id) {
        return { ...c, completed: nextVal };
      }
      return c;
    });

    const completedCount = cards.filter(c => c.completed).length;
    this.setData({
      cards,
      currentCard: { ...curr, completed: nextVal },
      completedCount
    });
    wx.setStorageSync("local_adventures", cards);

    wx.vibrateShort({ type: 'light' });
    wx.showToast({
      title: nextVal ? "恭喜达成挑战 💕" : "已重置状态",
      icon: "success"
    });

    const pairId = app.globalData.pairId || "";
    if (wx.cloud && pairId) {
      wx.cloud.callFunction({
        name: "dataOps",
        data: {
          type: "adventures",
          action: "toggle",
          pairId,
          id: curr.id
        }
      }).catch(() => {});
    }
  }
});

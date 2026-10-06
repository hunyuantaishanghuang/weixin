// pages/calendar/index.js
const app = getApp();

const MOODS = [
  { key: "happy", icon: "😊", label: "开心", color: "#F59E0B" },
  { key: "love", icon: "🥰", label: "甜蜜", color: "#F43F5E" },
  { key: "calm", icon: "😌", label: "平静", color: "#10B981" },
  { key: "sad", icon: "😢", label: "难过", color: "#0EA5E9" },
  { key: "angry", icon: "😠", label: "生气", color: "#E11D48" },
  { key: "tired", icon: "😩", label: "疲惫", color: "#8B5CF6" }
];

function getTodayString() {
  const d = new Date();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

Page({
  data: {
    selectedDate: getTodayString(),
    pairInfo: {},
    boyEntry: null,
    girlEntry: null,
    historyEntries: [],
    showRecordModal: false,
    myRole: "A", // A=Boy, B=Girl
    moodOptions: MOODS,
    selectedMoodKey: "love",
    diaryText: ""
  },

  onLoad() {
    this.loadCalendarData();
  },

  onShow() {
    this.loadCalendarData();
  },

  onPullDownRefresh() {
    this.loadCalendarData(() => {
      wx.stopPullDownRefresh();
    });
  },

  loadCalendarData(cb) {
    const pairId = app.globalData.pairId || wx.getStorageSync("local_pairId") || "";
    const pairInfo = app.globalData.pairInfo || wx.getStorageSync("local_pairInfo") || {
      nicknameA: "男孩",
      nicknameB: "女孩"
    };

    this.setData({ pairInfo });

    // 优先读取本地持久化数据
    const allDiaries = wx.getStorageSync("local_diaries") || [
      {
        id: "d_seed_1",
        dateKey: this.data.selectedDate,
        userRole: "A",
        isBoy: true,
        authorName: pairInfo.nicknameA || "男孩",
        moodEmoji: "😊",
        moodLabel: "开心",
        moodColor: "#F59E0B",
        text: "今天项目顺利上线，准备晚上做可乐鸡翅犒劳小宝贝~",
        time: "12:30"
      },
      {
        id: "d_seed_2",
        dateKey: this.data.selectedDate,
        userRole: "B",
        isBoy: false,
        authorName: pairInfo.nicknameB || "女孩",
        moodEmoji: "🥰",
        moodLabel: "甜蜜",
        moodColor: "#F43F5E",
        text: "偷喝了半杯草莓波波奶茶，看到TA发的微信心头暖洋洋的",
        time: "14:15"
      }
    ];

    this.processEntries(allDiaries);

    // 云端同步
    if (wx.cloud && pairId) {
      wx.cloud.callFunction({
        name: "dataOps",
        data: { type: "diaries", action: "get", pairId }
      }).then(res => {
        if (res.result && res.result.list && res.result.list.length > 0) {
          const list = res.result.list.map(item => ({
            ...item,
            id: item._id || item.id,
            isBoy: item.userRole === "A" || item.gender === "male",
            moodEmoji: item.mood ? item.mood.icon : (item.moodEmoji || "😊"),
            moodLabel: item.mood ? item.mood.label : (item.moodLabel || "开心"),
            moodColor: item.mood ? item.mood.color : (item.moodColor || "#F59E0B")
          }));
          wx.setStorageSync("local_diaries", list);
          this.processEntries(list);
        }
      }).catch(() => {}).finally(() => {
        if (typeof cb === "function") cb();
      });
    } else {
      if (typeof cb === "function") cb();
    }
  },

  processEntries(list) {
    const today = this.data.selectedDate;
    const boyEntry = list.find(e => (e.userRole === "A" || e.isBoy) && e.dateKey === today) || null;
    const girlEntry = list.find(e => (e.userRole === "B" || !e.isBoy) && e.dateKey === today) || null;

    this.setData({
      boyEntry,
      girlEntry,
      historyEntries: list.slice(0, 10)
    });
  },

  openRecordModal() {
    this.setData({
      showRecordModal: true,
      selectedMoodKey: "love",
      diaryText: ""
    });
  },

  closeRecordModal() {
    this.setData({ showRecordModal: false });
  },

  selectRole(e) {
    this.setData({ myRole: e.currentTarget.dataset.role });
  },

  selectMood(e) {
    this.setData({ selectedMoodKey: e.currentTarget.dataset.key });
  },

  onInputDiary(e) {
    this.setData({ diaryText: e.detail.value });
  },

  remindPartner() {
    wx.vibrateShort({ type: 'medium' });
    wx.showToast({ title: "已向TA发送日历心声提醒 💌", icon: "none" });
  },

  submitDiary() {
    const text = this.data.diaryText.trim();
    if (!text) {
      wx.showToast({ title: "请写下今天的日记心声~", icon: "none" });
      return;
    }

    const pairId = app.globalData.pairId || wx.getStorageSync("local_pairId") || "";
    const isBoy = this.data.myRole === "A";
    const authorName = isBoy
      ? (this.data.pairInfo.nicknameA || "男孩")
      : (this.data.pairInfo.nicknameB || "女孩");

    const moodObj = MOODS.find(m => m.key === this.data.selectedMoodKey) || MOODS[0];
    const newEntry = {
      id: "diary_" + Date.now(),
      dateKey: this.data.selectedDate,
      userRole: this.data.myRole,
      isBoy,
      authorName,
      mood: moodObj,
      moodEmoji: moodObj.icon,
      moodLabel: moodObj.label,
      moodColor: moodObj.color,
      text,
      time: new Date().getHours() + ":" + String(new Date().getMinutes()).padStart(2, "0"),
      createTime: new Date().toISOString(),
      pairId
    };

    // 重点：在本地列表中，更新当前用户当天的记录，而绝不替换另一半的记录！
    let currentList = wx.getStorageSync("local_diaries") || [];
    currentList = currentList.filter(e => !(e.dateKey === newEntry.dateKey && e.userRole === newEntry.userRole));
    currentList.unshift(newEntry);

    wx.setStorageSync("local_diaries", currentList);
    this.processEntries(currentList);

    this.setData({ showRecordModal: false });
    wx.showToast({ title: "心声记录已同步 💕", icon: "success" });

    // 云端保存：使用我们刚刚升级的 dataOps 云函数，自动识别 userRole 保持双人并存
    if (wx.cloud && pairId) {
      wx.cloud.callFunction({
        name: "dataOps",
        data: {
          type: "diaries",
          action: "add",
          pairId,
          data: newEntry
        }
      }).catch(err => {
        console.warn("云端同步提示:", err);
      });
    }
  }
});

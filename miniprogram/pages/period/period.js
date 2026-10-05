const app = getApp();
const api = require("../../api");

Page({
  data: {
    records: [],       // 月经开始日期列表
    cycle: 28,         // 平均周期
    duration: 5,       // 平均经期天数
    nextDate: "",      // 预测下次开始
    countdown: "",     // 距离下次天数
    fertileStart: "",  // 易孕开始
    fertileEnd: "",    // 易孕结束
    showAdd: false,
    pickDate: "",
  },
  onShow() {
    if (!app.globalData.pairId) return;
    this.loadRecords();
  },
  loadRecords() {
    api.call("dataOps", { collection: "periods", action: "list", orderBy: "date", order: "desc" }).then((res) => {
      if (res.result.success) {
        const records = res.result.list.map((r) => ({
          _id: r.id,
          date: r.date,
          ts: new Date(r.date).getTime(),
        })).sort((a, b) => b.ts - a.ts);
        this.compute(records);
      }
    });
  },
  compute(records) {
    let cycle = 28, duration = 5;
    if (records.length >= 2) {
      const gaps = [];
      for (let i = 0; i < records.length - 1; i++) {
        gaps.push(Math.round((records[i].ts - records[i + 1].ts) / 86400000));
      }
      cycle = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    }
    const last = records[0];
    let nextDate = "", countdown = "", fertileStart = "", fertileEnd = "";
    if (last) {
      const next = new Date(last.ts + cycle * 86400000);
      nextDate = this.fmt(next);
      const days = Math.round((next - new Date()) / 86400000);
      countdown = days >= 0 ? `还有 ${days} 天` : `已过去 ${-days} 天`;
      // 易孕期：下次前14天±5天
      const fStart = new Date(next.getTime() - (14 + 5) * 86400000);
      const fEnd = new Date(next.getTime() - (14 - 5) * 86400000);
      fertileStart = this.fmt(fStart);
      fertileEnd = this.fmt(fEnd);
    }
    this.setData({ records, cycle, duration, nextDate, countdown, fertileStart, fertileEnd });
  },
  openAdd() {
    this.setData({ showAdd: true, pickDate: this.fmt(new Date()) });
  },
  closeAdd() { this.setData({ showAdd: false }); },
  onDate(e) { this.setData({ pickDate: e.detail.value }); },
  submit() {
    api.call("dataOps", { collection: "periods", action: "add", data: { date: this.data.pickDate } }).then(() => {
      this.setData({ showAdd: false });
      this.loadRecords();
    });
  },
  remove(e) {
    const id = e.currentTarget.dataset.id;
    api.call("dataOps", { collection: "periods", action: "remove", _id: id }).then(() => this.loadRecords());
  },
  fmt(d) {
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  },
  noop() {},
});

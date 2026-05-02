const app = getApp();

Page({
  data: {
    allRecords: []
  },
  onLoad() {
    this.loadAllRecords();
  },
  onShow() {
    this.loadAllRecords(); // 每次显示刷新，确保数据最新
  },
  loadAllRecords() {
    let clothes = wx.getStorageSync(app.globalData.STORAGE_CLOTHES) || [];
    let records = [];
    clothes.forEach(cloth => {
      (cloth.wearRecords || []).forEach(rec => {
        records.push({
          id: rec.id,
          clothName: cloth.name,
          date: rec.date,
          event: rec.event || '无备注'
        });
      });
    });
    // 按日期倒序排列（最新在上）
    records.sort((a, b) => new Date(b.date) - new Date(a.date));
    this.setData({ allRecords: records });
  },

});
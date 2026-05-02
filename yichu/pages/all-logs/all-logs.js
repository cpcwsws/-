const app = getApp();

Page({
  data: { allRecords: [] },
  onLoad(options) {
    let clothes = wx.getStorageSync(app.globalData.STORAGE_CLOTHES) || [];
    let clothe = clothes.find(c => c.id === options.clotheId);
    let records = clothe ? (clothe.wearRecords || []) : [];
    records.sort((a,b) => new Date(b.date) - new Date(a.date));
    this.setData({ allRecords: records });
  },

});
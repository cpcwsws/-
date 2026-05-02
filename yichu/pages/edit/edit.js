const app = getApp();

Page({
  data: { clotheId: '', wearRecords: [] },
  onLoad(options) { this.setData({ clotheId: options.id }); this.loadRecords(); },
  onShow() { this.loadRecords(); },
  loadRecords() {
    let clothes = wx.getStorageSync(app.globalData.STORAGE_CLOTHES) || [];
    let clothe = clothes.find(c => c.id === this.data.clotheId);
    let records = clothe ? (clothe.wearRecords || []) : [];
    records.sort((a,b) => new Date(b.date) - new Date(a.date));
    this.setData({ wearRecords: records });
  },
  viewAllLogs() { wx.navigateTo({ url: `/pages/all-logs/all-logs?clotheId=${this.data.clotheId}` }); },
  onEditInfo() { wx.navigateTo({ url: `/pages/clothe-edit/clothe-edit?id=${this.data.clotheId}` }); },
  onAddRecord() { wx.navigateTo({ url: `/pages/record-add/record-add?clotheId=${this.data.clotheId}` }); },
  onViewPhotoSpace() { wx.navigateTo({ url: `/pages/photo-gallery/photo-gallery?clotheId=${this.data.clotheId}` }); },
});
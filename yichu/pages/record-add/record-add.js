const app = getApp();

Page({
  data: { clotheId: '', recordDate: '', eventDesc: '', photoPath: '', maxDate: '' },
  onLoad(options) {
    this.setData({ clotheId: options.clotheId });
    let today = new Date();
    let yyyy = today.getFullYear();
    let mm = String(today.getMonth() + 1).padStart(2, '0');
    let dd = String(today.getDate()).padStart(2, '0');
    let todayStr = `${yyyy}-${mm}-${dd}`;
    this.setData({ recordDate: todayStr, maxDate: todayStr });
  },
  onDateChange(e) { this.setData({ recordDate: e.detail.value }); },
  onEventInput(e) { this.setData({ eventDesc: e.detail.value }); },
  uploadRecordPhoto() { /* 同前 */ },
  saveRecord() { /* 同前 */ },
  back() { wx.navigateBack(); },

});
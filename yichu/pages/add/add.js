const app = getApp();

Page({
  data: { imagePath: '', name: '', price: '', purchaseDate: '', tag: '', currentDate: '' },
  onLoad() {
    let now = new Date();
    let yyyy = now.getFullYear();
    let mm = String(now.getMonth() + 1).padStart(2, '0');
    let dd = String(now.getDate()).padStart(2, '0');
    this.setData({ currentDate: `${yyyy}-${mm}-${dd}` });
  },
  uploadImage() {
    wx.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album', 'camera'], success: (res) => {
      const tempPath = res.tempFilePaths[0];
      wx.compressImage({ src: tempPath, quality: 80, success: (compressRes) => {
        wx.saveFile({ tempFilePath: compressRes.tempFilePath, success: (saveRes) => {
          this.setData({ imagePath: saveRes.savedFilePath });
        }, fail: () => { this.setData({ imagePath: tempPath }); } });
      }, fail: () => { this.setData({ imagePath: tempPath }); } });
    } });
  },
  cropCover() {
    if (!this.data.imagePath) { wx.showToast({ title: '请先上传图片', icon: 'none' }); return; }
    wx.navigateTo({ url: `/pages/crop-cover/crop-cover?imagePath=${encodeURIComponent(this.data.imagePath)}&tempFlag=true` });
  },
  onNameInput(e) { this.setData({ name: e.detail.value }); },
  onPriceInput(e) { this.setData({ price: e.detail.value }); },
  onDateChange(e) { this.setData({ purchaseDate: e.detail.value }); },
  onTagInput(e) { this.setData({ tag: e.detail.value }); },
  saveClothe() {
    let { imagePath, name, price, purchaseDate, tag } = this.data;
    if (!imagePath || !name || !purchaseDate || !tag) { wx.showToast({ title: '请完善所有信息', icon: 'none' }); return; }
    let clothes = wx.getStorageSync(app.globalData.STORAGE_CLOTHES) || [];
    let newId = Date.now().toString();
    let newClothe = { id: newId, name, price: parseFloat(price) || 0, purchaseDate, tag, imagePath, coverImage: imagePath, wearRecords: [] };
    clothes.push(newClothe);
    try {
      wx.setStorageSync(app.globalData.STORAGE_CLOTHES, clothes);
      wx.showToast({ title: '保存成功', icon: 'success', success: () => setTimeout(() => wx.navigateBack(), 1000) });
    } catch(e) { wx.showToast({ title: '保存失败', icon: 'none' }); }
  },
  cancelAdd() { wx.navigateBack(); },
});
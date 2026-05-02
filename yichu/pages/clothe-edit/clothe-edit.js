const app = getApp();

Page({
  data: { id: '', imagePath: '', name: '', price: '', purchaseDate: '', tag: '' },
  onLoad(options) {
    this.setData({ id: options.id });
    let clothes = wx.getStorageSync(app.globalData.STORAGE_CLOTHES) || [];
    let clothe = clothes.find(c => c.id === options.id);
    if (clothe) {
      this.setData({
        imagePath: clothe.imagePath,
        name: clothe.name,
        price: clothe.price ? clothe.price.toString() : '',
        purchaseDate: clothe.purchaseDate,
        tag: clothe.tag
      });
    }
  },
  uploadImage() { /* 与添加页面相同，略 */ },
  cropCover() { /* 略 */ },
  onNameInput(e) { this.setData({ name: e.detail.value }); },
  onPriceInput(e) { this.setData({ price: e.detail.value }); },
  onDateChange(e) { this.setData({ purchaseDate: e.detail.value }); },
  onTagInput(e) { this.setData({ tag: e.detail.value }); },
  updateClothe() {
    let clothes = wx.getStorageSync(app.globalData.STORAGE_CLOTHES) || [];
    let index = clothes.findIndex(c => c.id === this.data.id);
    if (index !== -1) {
      clothes[index].name = this.data.name;
      clothes[index].price = parseFloat(this.data.price) || 0;
      clothes[index].purchaseDate = this.data.purchaseDate;
      clothes[index].tag = this.data.tag;
      clothes[index].imagePath = this.data.imagePath;
      if (!clothes[index].coverImage) clothes[index].coverImage = this.data.imagePath;
      wx.setStorageSync(app.globalData.STORAGE_CLOTHES, clothes);
      wx.showToast({ title: '修改成功', icon: 'success', success: () => setTimeout(() => wx.navigateBack(), 1000) });
    } else { wx.showToast({ title: '修改失败', icon: 'none' }); }
  },
  back() { wx.navigateBack(); },
});
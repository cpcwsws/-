const app = getApp();

Page({
  data: {
    photoPath: '',
    clothId: '',
    recordId: '',
    isCover: false
  },
  onLoad(options) {
    this.setData({
      photoPath: decodeURIComponent(options.photoPath),
      clothId: options.clothId,
      recordId: options.recordId || '',
      isCover: options.isCover === 'true'
    });
  },
  setAsCover() {
    const that = this;
    // 跳转到裁剪页面，并传递衣服ID和照片路径
    wx.navigateTo({
      url: `/pages/crop-cover/crop-cover?imagePath=${encodeURIComponent(this.data.photoPath)}&clotheId=${this.data.clothId}&recordId=${this.data.recordId}`
    });
  },

});
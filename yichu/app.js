// app.js
App({
    globalData: {
      // 统一存储key
      STORAGE_CLOTHES: 'wardrobe_clothes',
      STORAGE_CATEGORIES: 'wardrobe_categories'
    },
    onLaunch() {
      // 初始化数据
      let clothes = wx.getStorageSync(this.globalData.STORAGE_CLOTHES);
      if (!clothes) {
        wx.setStorageSync(this.globalData.STORAGE_CLOTHES, []);
      }
      let categories = wx.getStorageSync(this.globalData.STORAGE_CATEGORIES);
      if (!categories) {
        wx.setStorageSync(this.globalData.STORAGE_CATEGORIES, []);
      }
    }
  })
const app = getApp();

Page({
  data: {
    allItems: [],        // 所有照片数据
    displayItems: [],    // 当前显示的照片（按布局/排序后）
    columns: 2,          // 列数
    sortType: 'default', // default, price_asc, price_desc, wear_asc, wear_desc
    filterClotheId: ''   // 可选，只显示某件衣服的照片
  },
  onLoad(options) {
    this.setData({ filterClotheId: options.clotheId || '' });
    this.loadLayoutColumns();
    this.loadData();
  },
  onShow() {
    this.loadData(); // 每次显示刷新，例如封面更新后
  },
  loadLayoutColumns() {
    const cols = wx.getStorageSync('photo_gallery_columns') || 2;
    this.setData({ columns: cols });
  },
  loadData() {
    let clothes = wx.getStorageSync(app.globalData.STORAGE_CLOTHES) || [];
    let items = [];
    clothes.forEach(cloth => {
      if (this.data.filterClotheId && cloth.id !== this.data.filterClotheId) return;
      // 衣服主图
      if (cloth.imagePath) {
        items.push({
          photoPath: cloth.imagePath,
          clothName: cloth.name,
          wearCount: (cloth.wearRecords || []).length,
          isCover: (cloth.coverImage === cloth.imagePath),
          clothId: cloth.id,
          recordId: null,
          type: 'main',
          timestamp: cloth.purchaseDate,
          price: cloth.price || 0
        });
      }
      // 穿着记录照片
      (cloth.wearRecords || []).forEach(record => {
        if (record.photo) {
          items.push({
            photoPath: record.photo,
            clothName: cloth.name,
            wearCount: (cloth.wearRecords || []).length,
            isCover: (cloth.coverImage === record.photo),
            clothId: cloth.id,
            recordId: record.id,
            type: 'record',
            timestamp: record.date,
            price: cloth.price || 0
          });
        }
      });
    });
    this.applySorting(items);
    this.setData({ allItems: items, displayItems: items });
  },
  applySorting(items) {
    const sortType = this.data.sortType;
    if (sortType === 'price_asc') items.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (sortType === 'price_desc') items.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (sortType === 'wear_asc') items.sort((a, b) => a.wearCount - b.wearCount);
    else if (sortType === 'wear_desc') items.sort((a, b) => b.wearCount - a.wearCount);
    else items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return items;
  },
  onLayoutChange() {
    const that = this;
    wx.showActionSheet({
      itemList: ['一行2列', '一行3列', '一行4列'],
      success(res) {
        let columns = [2, 3, 4][res.tapIndex];
        that.setData({ columns });
        wx.setStorageSync('photo_gallery_columns', columns);
      }
    });
  },
  onSortTap() {
    const that = this;
    wx.showActionSheet({
      itemList: ['默认（时间↓）', '价格从低到高', '价格从高到低', '穿着次数最少', '穿着次数最多'],
      success(res) {
        let sortType = 'default';
        if (res.tapIndex === 1) sortType = 'price_asc';
        else if (res.tapIndex === 2) sortType = 'price_desc';
        else if (res.tapIndex === 3) sortType = 'wear_asc';
        else if (res.tapIndex === 4) sortType = 'wear_desc';
        that.setData({ sortType }, () => that.loadData());
      }
    });
  },
  onPhotoTap(e) {
    const photo = e.currentTarget.dataset.photo;
    wx.navigateTo({
      url: `/pages/photo-detail/photo-detail?photoPath=${encodeURIComponent(photo.photoPath)}&clothId=${photo.clothId}&recordId=${photo.recordId || ''}&isCover=${photo.isCover}`
    });
  },

});
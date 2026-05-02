const app = getApp();

Page({
  data: {
    clothes: [],
    categories: [],
    currentCategory: '全部',
    columns: 2,
    displayClothes: [],
    scrollIntoView: '',
    sortType: 'default'
  },
  onShow() { this.loadData(); this.loadLayoutColumns(); },
  loadData() {
    let clothes = wx.getStorageSync(app.globalData.STORAGE_CLOTHES) || [];
    clothes = clothes.map(c => {
      let wearCount = (c.wearRecords || []).length;
      return { ...c, wearCount, price: c.price || 0 };
    });
    this.applySorting(clothes);
    let categoriesSet = new Set();
    clothes.forEach(c => { if (c.tag) categoriesSet.add(c.tag); });
    let categories = Array.from(categoriesSet);
    wx.setStorageSync(app.globalData.STORAGE_CATEGORIES, categories);
    this.setData({ clothes, categories }, () => this.filterClothesByCategory());
  },
  applySorting(clothes) {
    const sortType = this.data.sortType;
    if (sortType === 'price_asc') clothes.sort((a,b) => (a.price||0) - (b.price||0));
    else if (sortType === 'price_desc') clothes.sort((a,b) => (b.price||0) - (a.price||0));
    else if (sortType === 'wear_asc') clothes.sort((a,b) => a.wearCount - b.wearCount);
    else if (sortType === 'wear_desc') clothes.sort((a,b) => b.wearCount - a.wearCount);
    else clothes.sort((a,b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
    return clothes;
  },
  loadLayoutColumns() {
    const cols = wx.getStorageSync('wardrobe_layout_columns') || 2;
    this.setData({ columns: cols });
  },
  filterClothesByCategory() {
    let { clothes, currentCategory } = this.data;
    let filtered = currentCategory === '全部' ? clothes : clothes.filter(c => c.tag === currentCategory);
    this.setData({ displayClothes: filtered });
  },
  onCategoryTap(e) {
    const cate = e.currentTarget.dataset.cate;
    this.setData({ currentCategory: cate, scrollIntoView: `cate_${cate}` }, () => this.filterClothesByCategory());
  },
  onLayoutChange() {
    wx.showActionSheet({
      itemList: ['一行2列', '一行3列', '一行4列'],
      success: (res) => {
        let columns = [2, 3, 4][res.tapIndex];
        this.setData({ columns });
        wx.setStorageSync('wardrobe_layout_columns', columns);
      }
    });
  },
  onSortTap() {
    const that = this;
    wx.showActionSheet({
      itemList: ['默认（购买时间↓）', '价格从低到高', '价格从高到低', '穿着次数最少', '穿着次数最多'],
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
  // 删除功能 - 修复版
  onClearTap() {
    const that = this;
    const categories = this.data.categories;
    if (categories.length === 0 && this.data.clothes.length === 0) {
      wx.showToast({ title: '暂无数据可清除', icon: 'none' });
      return;
    }
    let itemList = ['🗑️ 清除全部衣服'];
    categories.forEach(c => {
      itemList.push(`🧹 清除分类「${c}」`);
    });
    wx.showActionSheet({
      itemList: itemList,
      success(res) {
        const index = res.tapIndex;
        if (index === 0) {
          // 清除全部
          wx.showModal({
            title: '确认清除',
            content: '删除所有衣服？此操作不可恢复。',
            confirmColor: '#0077B6',
            success(modalRes) {
              if (modalRes.confirm) {
                wx.setStorageSync(app.globalData.STORAGE_CLOTHES, []);
                wx.setStorageSync(app.globalData.STORAGE_CATEGORIES, []);
                that.setData({ currentCategory: '全部', clothes: [], categories: [], displayClothes: [] });
                that.loadData(); // 重新加载刷新视图
                wx.showToast({ title: '已清除全部', icon: 'success' });
              }
            }
          });
        } else {
          // 清除指定分类
          const categoryToDelete = categories[index - 1];
          wx.showModal({
            title: '确认清除',
            content: `删除分类「${categoryToDelete}」及其所有衣服？`,
            confirmColor: '#0077B6',
            success(modalRes) {
              if (modalRes.confirm) {
                let clothes = wx.getStorageSync(app.globalData.STORAGE_CLOTHES) || [];
                const newClothes = clothes.filter(c => c.tag !== categoryToDelete);
                wx.setStorageSync(app.globalData.STORAGE_CLOTHES, newClothes);
                // 更新分类集合
                let newCategories = [...new Set(newClothes.map(c => c.tag))];
                wx.setStorageSync(app.globalData.STORAGE_CATEGORIES, newCategories);
                // 如果当前选中的分类是被删除的，切回“全部”
                if (that.data.currentCategory === categoryToDelete) {
                  that.setData({ currentCategory: '全部' });
                }
                that.loadData(); // 重新加载
                wx.showToast({ title: `已清除分类「${categoryToDelete}」`, icon: 'success' });
              }
            }
          });
        }
      },
      fail(err) {
        console.log('取消操作', err);
      }
    });
  },
  onSafetyTap() {
    wx.showModal({
      title: '🛡️ 安全通知',
      content: '您的衣橱数据仅保存在本设备，请注意备份。官方不会索要任何密码。定期清理无用照片，避免存储不足。',
      showCancel: false,
      confirmText: '知道了',
      confirmColor: '#0077B6'
    });
  },
  onPhotoGalleryTap() {
    wx.navigateTo({ url: '/pages/photo-gallery/photo-gallery' });
  },
  onGlobalLogsTap() {
    wx.navigateTo({ url: '/pages/global-logs/global-logs' });
  },
  onCardTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/edit/edit?id=${id}` });
  },
  goToAdd() {
    wx.navigateTo({ url: '/pages/add/add' });
  }
});
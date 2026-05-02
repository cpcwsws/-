Page({
    data: { content: '' },
    onInput(e) { this.setData({ content: e.detail.value }); },
    submitFeedback() {
      if (!this.data.content.trim()) { wx.showToast({ title: '请输入内容', icon: 'none' }); return; }
      wx.showToast({ title: '感谢反馈！', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    },
  });
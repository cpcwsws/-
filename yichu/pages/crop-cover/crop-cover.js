Page({
    data: {
      imagePath: '',
      clotheId: '',
      recordId: '',
      canvasWidth: 300,
      canvasHeight: 225,
      cropX: 0,
      cropY: 0,
      cropWidth: 300,
      cropHeight: 225,
      startX: 0,
      startY: 0,
      isMoving: false
    },
    onLoad(options) {
      this.setData({
        imagePath: decodeURIComponent(options.imagePath),
        clotheId: options.clotheId || '',
        recordId: options.recordId || ''
      });
      this.initCanvas();
    },
    initCanvas() {
      const query = wx.createSelectorQuery();
      query.select('#cropCanvas').fields({ node: true, size: true }).exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const canvasWidth = this.data.canvasWidth;
        const canvasHeight = this.data.canvasHeight;
        canvas.width = canvasWidth * dpr;
        canvas.height = canvasHeight * dpr;
        ctx.scale(dpr, dpr);
        const img = canvas.createImage();
        img.onload = () => {
          const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
          const drawWidth = img.width * scale;
          const drawHeight = img.height * scale;
          const drawX = (canvasWidth - drawWidth) / 2;
          const drawY = (canvasHeight - drawHeight) / 2;
          this.setData({
            drawX, drawY, drawWidth, drawHeight,
            cropX: 0, cropY: 0, cropWidth: canvasWidth, cropHeight: canvasHeight
          });
          this.drawCanvas(img, ctx);
        };
        img.src = this.data.imagePath;
      });
    },
    drawCanvas(img, ctx) {
      const { drawX, drawY, drawWidth, drawHeight, cropX, cropY, cropWidth, cropHeight, canvasWidth, canvasHeight } = this.data;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      // 蒙层
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvasWidth, cropY);
      ctx.fillRect(0, cropY + cropHeight, canvasWidth, canvasHeight - cropY - cropHeight);
      ctx.fillRect(0, cropY, cropX, cropHeight);
      ctx.fillRect(cropX + cropWidth, cropY, canvasWidth - cropX - cropWidth, cropHeight);
      // 裁剪框边框
      ctx.strokeStyle = '#0077B6';
      ctx.lineWidth = 3;
      ctx.strokeRect(cropX, cropY, cropWidth, cropHeight);
    },
    onTouchStart(e) {
      const touch = e.touches[0];
      this.setData({
        startX: touch.clientX,
        startY: touch.clientY,
        isMoving: true
      });
    },
    onTouchMove(e) {
      if (!this.data.isMoving) return;
      const touch = e.touches[0];
      let deltaX = touch.clientX - this.data.startX;
      let deltaY = touch.clientY - this.data.startY;
      let newCropX = this.data.cropX + deltaX;
      let newCropY = this.data.cropY + deltaY;
      const maxX = this.data.canvasWidth - this.data.cropWidth;
      const maxY = this.data.canvasHeight - this.data.cropHeight;
      newCropX = Math.min(maxX, Math.max(0, newCropX));
      newCropY = Math.min(maxY, Math.max(0, newCropY));
      this.setData({
        cropX: newCropX,
        cropY: newCropY,
        startX: touch.clientX,
        startY: touch.clientY
      });
      // 重绘
      const query = wx.createSelectorQuery();
      query.select('#cropCanvas').node().exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const img = canvas.createImage();
        img.onload = () => this.drawCanvas(img, ctx);
        img.src = this.data.imagePath;
      });
    },
    onTouchEnd() {
      this.setData({ isMoving: false });
    },
    confirmCrop() {
      const query = wx.createSelectorQuery();
      query.select('#cropCanvas').node().exec((res) => {
        const canvas = res[0].node;
        const { cropX, cropY, cropWidth, cropHeight } = this.data;
        wx.canvasToTempFilePath({
          canvas: canvas,
          x: cropX,
          y: cropY,
          width: cropWidth,
          height: cropHeight,
          destWidth: cropWidth,
          destHeight: cropHeight,
          success: (res) => {
            wx.saveFile({
              tempFilePath: res.tempFilePath,
              success: (saveRes) => {
                const croppedPath = saveRes.savedFilePath;
                const app = getApp();
                if (this.data.clotheId) {
                  let clothes = wx.getStorageSync(app.globalData.STORAGE_CLOTHES) || [];
                  let idx = clothes.findIndex(c => c.id === this.data.clotheId);
                  if (idx !== -1) {
                    clothes[idx].coverImage = croppedPath;
                    wx.setStorageSync(app.globalData.STORAGE_CLOTHES, clothes);
                    wx.showToast({ title: '封面已更新', icon: 'success' });
                    setTimeout(() => wx.navigateBack(), 1000);
                  } else {
                    wx.showToast({ title: '衣服不存在', icon: 'none' });
                  }
                } else {
                  wx.setStorageSync('temp_cropped_image', croppedPath);
                  wx.showToast({ title: '裁剪完成', icon: 'success' });
                  setTimeout(() => wx.navigateBack(), 1000);
                }
              }
            });
          }
        });
      });
    },
    cancelCrop() {
      wx.navigateBack();
    }
  });
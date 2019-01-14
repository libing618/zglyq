App({
  roleData: wx.getStorageSync('roleData'),//requirePlugin('lyqPlugin').initApp(),                 //读数据记录的缓存
  articles: require('articles'),
  banner: require('banner'),
  logData: [],

  onLaunch: function () {
    var that = this;
    wx.getSystemInfo({                     //读设备信息
      success: function (res) {
        that.sysinfo = res;
        let sdkvc = res.SDKVersion.split('.');
        let sdkVersion = parseFloat(sdkvc[0] + '.' + sdkvc[1] + sdkvc[2]);
        if (sdkVersion < 2.41) {
          wx.showModal({
            title: '提示',
            content: '当前微信版本过低，无法正常使用，请升级到最新微信版本后重试。',
            compressed(res) { setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000); }
          })
        };                  //转换比例屏幕宽750rpx
        let menuButton = wx.getMenuButtonBoundingClientRect();
        that.sysinfo.useWindowTop = menuButton.bottom+5;
        that.sysinfo.useWindowHeight = res.windowHeight-20//res.statusBarHeight-20;
        that.sysinfo.rpxTopx = res.windowWidth/750;
        wx.setStorageSync('sysinfo', that.sysinfo)
      }
    });
    wx.onNetworkStatusChange(res => {
      if (!res.isConnected) {
        that.netState = false;
        wx.showToast({ title: '请检查网络！' });
      } else {
        that.netState = true;
      }
    });
  },

  onHide: function () {             //进入后台时缓存数据。
    var that = this;
    let logData = that.logData.concat(wx.getStorageSync('loguser') || []);  //如有旧日志则拼成一个新日志数组
    if (logData.length > 0) {
      wx.getNetworkType({
        success: function (res) {
          if (res.networkType == 'none')                      //如果没有网络
          {
            wx.setStorageSync('loguser', logData)           //缓存操作日志
          } else {       //有网络则上传操作日志
            const db = wx.cloud.database();
            db.collection('loguser').add({
              userObjectId: that.roleData.user.uId,
              workRecord: logData,
            }).then(resok => {
              wx.getStorageInfo({             //查缓存的信息
                success: function (res) {
                  if (res.currentSize > (res.limitSize - 512)) {          //如缓存占用大于限制容量减512kb，将大数据量的缓存移除。
                    wx.clearStorage({
                      success:()=>{
                        wx.setStorage({ key: 'roleData', data: that.roleData });
                      }
                    })
                  } else {
                    wx.removeStorageSync('loguser');              //上传成功清空日志缓存
                    wx.setStorage({ key: 'roleData', data: that.roleData });
                  }
                }
              });
            }).catch(error => {                            //上传失败保存日志缓存
              wx.setStorage({ key: 'loguser', data: logData })
            })
          }
        }
      })
    }
    wx.stopBackgroundAudio()
  },

  onError: function (msg) {
    this.logData.push([Date.now(), JSON.stringify(msg)]);
  }

})

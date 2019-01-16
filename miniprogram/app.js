App({
  roleData: wx.getStorageSync('roleData'),              //读数据记录的缓存
  articles: require('articles'),
  banner: require('banner'),
  logData: [],

  onLaunch: function () {
    var that = this;
    if (!that.roleData) {that.roleData = requirePlugin('lyqPlugin').roleData}
    let menuButton = wx.getMenuButtonBoundingClientRect()
    that.sysinfo = requirePlugin('lyqPlugin').initApp(menuButton.bottom);           // 读系统参数
    console.log(that.sysinfo)
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

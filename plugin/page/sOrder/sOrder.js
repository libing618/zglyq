//共享信息管理
import {checkRols,shareMessage} from '../../modules/initForm';
const sysinfo = wx.getStorageSync('sysinfo');
const roleData = wx.getStorageSync('roleData');
Page({
  data: {
    pNo: 'share',                       //流程
    statusBar: sysinfo.statusBarHeight,
    mPage: [],
    pageData: {}
  },

  onLoad: function (options) {
    checkRols(0,roleData.user)     //负责人或综合条线员工
  }
  
})

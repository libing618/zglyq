//共享信息管理
import {hTabClick} from '../../index';
import {checkRols,shareMessage} from '../../modules/initForm';
const shareFamily = require('../../modules/procedureclass').share.afamily;
const sysinfo = wx.getStorageSync('sysinfo');
const roleData = wx.getStorageSync('roleData');
const db = wx.cloud.database();
Page({
  data: {
    pNo: 'share',                       //流程
    statusBar: sysinfo.statusBarHeight,
    ht:{
      navTabs: ['可以开始','等待订单','停止服务'],
      tWidth: 470 * sysinfo.rpxTopx / 3,   //每个tab宽度470rpx÷3
      fLength: 3,
      twwHalf: 48 * sysinfo.rpxTopx,
      pageCk: 0
    },
    mPage: [],
    pageData: {}
  },

  onLoad: function (options) {
    var that = this;
    if (checkRols(1,roleData.user)) {       //检查用户权限
      shareFamily.forEach((afamily,i)=>{
        aIndex.share[roleData.uUnit._id][i].forEach(ufod=>{
          pageData[ufod] = {uName:aData.share[ufod].uName,thumbnail:aData.share[ufod].thumbnail};
          pageData[ufod].title = pageSuccess[1].p+aData.unfinishedorder[ufod].amount +'/'+ pageSuccess[2].p+aData.unfinishedorder[ufod].amount;
        })
      })
      that.setData({
        cPage: aIndex.share[roleData.uUnit._id],
        pageData: pageData
      });
    };
  },

  hTabClick: hTabClick,

  fRegisterShare: function({currentTarget:{id}}){
    var that = this;
    switch (id) {
      case 'fSave':
        db.collection('share')
        break;
      default:
        wx.navigateBack({ delta: 1 });
    }
  }

})

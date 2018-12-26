//共享信息管理
import {hTabClick} from '../../modules/util.js';
import {checkRols,shareMessage} from '../../modules/initForm';
const shareFamily = require('../../modules/procedureclass').share.afamily;
const db = wx.cloud.database();
var app = getApp()
Page({
  data: {
    pNo: 'share',                       //流程
    statusBar: app.sysinfo.statusBarHeight,
    ht:{
      navTabs: ['可以开始','等待订单','停止服务'],
      tWidth: 470 * app.sysinfo.rpxTopx / 3,   //每个tab宽度470rpx÷3
      fLength: 3,
      twwHalf: 48 * app.sysinfo.rpxTopx,
      pageCk: 0
    },
    mPage: [],
    pageData: {}
  },

  onLoad: function (options) {
    var that = this;
    if (checkRols(1,app.roleData.user)) {       //检查用户权限
    shareFamily.forEach((afamily,i)=>{
        app.aIndex.share[app.roleData.uUnit._id][i].forEach(ufod=>{
          pageData[ufod] = {uName:app.aData.share[ufod].uName,thumbnail:app.aData.share[ufod].thumbnail};
          pageData[ufod].title = pageSuccess[1].p+app.aData.unfinishedorder[ufod].amount +'/'+ pageSuccess[2].p+app.aData.unfinishedorder[ufod].amount;
        })
      })
      that.setData({
        cPage: app.aIndex.share[app.roleData.uUnit._id],
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
  },
  onShareAppMessage: shareMessage

})

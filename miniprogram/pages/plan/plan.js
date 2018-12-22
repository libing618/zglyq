import {shareMessage} from '../../libs/util.js';
const { iMenu, cargoCount } = requirePlugin('lyqPlugin');
const db = wx.cloud.database();
var app = getApp();
Page({
  data:{
    mPage: [],
    pNo: 'goods',                       //商品信息
    pageData: {}
  },

  setPage: function(){
    db.collection('goods').where({unitId:app.roleData.user.unit}).count().then(({total})=>{
      this.setData({pandect:total})
    })
  },

  onReady: function(){
    this.setPage();              //更新缓存以后有变化的数据
    this.setData({
      statusBar: app.sysinfo.statusBarHeight,
      wWidth: app.sysinfo.windowWidth,
      grids: iMenu(1, app.roleData.wmenu[1])
    })
  },

  onPullDownRefresh:function(){
    this.setPage()
  },

  onShareAppMessage: shareMessage
})

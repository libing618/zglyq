import {shareMessage} from '../../libs/util.js';
const { iMenu, cargoCount } = requirePlugin('lyqPlugin');

var app = getApp()
Page({
  data:{
    mPage: [],
    pNo: 'cargo',                       //成品信息
    pageData: {},
    grids: []
  },
  onLoad:function(options){
    this.setPage();
  },

  setPage: function(){
    cargoCount(['canSupply', 'cargoStock']).then(cSum=>{
      this.setData({
        pandect:cSum
      })
    })
  },

  onReady:function(){
    this.setData({
      statusBar: app.sysinfo.statusBarHeight,
      grids: iMenu(2, app.roleData.wmenu[2])
    })
  },

  onPullDownRefresh: function() {
    this.setPage();
  },

  onShareAppMessage: shareMessage
})

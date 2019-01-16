import {shareMessage} from '../../libs/util.js';
const { iMenu, getData, cargoCount } = requirePlugin('lyqPlugin');
Page({
  data:{
    mPage: [],
    pNo: 'cargo',                       //成品信息
    pageData: {}
  },

  onLoad: function () {
    let { sysinfo, roleData } = getApp();
    this.setData({
      statusBar: sysinfo.statusBarHeight,
      wWidth: sysinfo.windowWidth,
      grids: iMenu(2, roleData.wmenu[2])
    })
  },

  onReady: function () {
    let that = this;              //更新缓存以后有变化的数据
    that.cargo = new getData('cargo');
    that.cargo.upData().then(gData => {
      if (gData){
        that.cargo.addViewData(gData, 'mPage')
      }
    });
  },

  setPage: function(){
    cargoCount(['canSupply', 'cargoStock']).then(cSum=>{
      this.setData({
        pandect:cSum
      })
    })
  },

  onPullDownRefresh: function () {
    this.cargo.upData().then(aSetData = {
      if(aSetData) {
        this.cargo.addViewData(aSetData, 'mPage')
      }
    });
  },

  onReachBottom: function () {
    this.cargo[this.data.pageCk].downData().then(aSetData = {
      if(aSetData) {
        this.cargo.addViewData(aSetData, 'mPage')
      }
    });
  },

  onShareAppMessage: shareMessage
})

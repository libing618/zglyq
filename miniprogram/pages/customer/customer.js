import {shareMessage} from '../../libs/util.js';
const { iMenu, getData, cargoCount } = requirePlugin('lyqPlugin');
Page({
  data:{
    mPage: [],
    pNo: 'cargo',                       //商品信息
    pageData: {}
  },

  setPage: function(iu){
    cargoCount(['sold', 'reserve', 'payment', 'delivering', 'delivered']).then(cSum=>{
      this.setData({
        pandect:cSum
      })
    })
  },

  onLoad: function () {
    let that = this;
    let { sysinfo, roleData } = getApp();
    this.setData({
      statusBar: sysinfo.statusBarHeight,
      wWidth: sysinfo.windowWidth,
      grids: iMenu(3, roleData.wmenu[3])
    })
  },

  onReady:function(){
    let that = this;              //更新缓存以后有变化的数据
    that.cargo = new getData('cargo');
    that.cargo.upData().then(gData => {
      if (gData) {
        that.cargo.addViewData(gData, 'mPage')
      }
    });
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

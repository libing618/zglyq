import {shareMessage} from '../../libs/util.js';
const { iMenu, cargoCount, getData } = requirePlugin('lyqPlugin');
Page({
  data:{
    mPage: [],
    pNo: 'goods',                       //商品信息
    pageData: {}
  },

  onLoad: function () {
    let { sysinfo, roleData } = getApp();
    this.setData({
      statusBar: sysinfo.statusBarHeight,
      wWidth: sysinfo.windowWidth,
      grids: iMenu(1, roleData.wmenu[1])
    })
  },

  onReady: function(){
    let that = this;              //更新缓存以后有变化的数据
    that.goods = new getData('goods');
    that.goods.upData().then(gData=>{
      if (gData) {
        that.goods.addViewData(gData, 'mPage')
      }
    });
  },

  onPullDownRefresh: function () {
    this.goods.upData().then(aSetData = {
      if(aSetData) {
        this.goods.addViewData(aSetData, 'mPage')
      }
    });
  },

  onReachBottom: function () {
    this.goods[this.data.pageCk].downData().then(aSetData = {
      if(aSetData) {
        this.goods.addViewData(aSetData, 'mPage')
      }
    });
  },
  onShareAppMessage: shareMessage
})

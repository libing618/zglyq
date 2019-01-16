import {tabClick,shareMessage, loginAndMenu,openWxLogin} from '../../libs/util.js';
const { iMenu, getData } = requirePlugin('lyqPlugin');
Page({
  data: {
    autoplay: true,
    pNo: 'articles',                       //文章类信息
    fLength: 4,                       //nav文字数
    pageCk:1,
    tabs: ["品牌建设", "政策扶持", "我的商圈"]
  },

  onLoad: function () {
    var app = getApp();
    let that = this;
    let grids;
    wx.hideTabBar();
    let pageData = app.banner.nData;
    Object.assign(pageData, app.articles.nData);
    that.banner = new getData('banner');
    that.articles = new getData('articles');
    return new Promise((resolve,reject)=>{
      grids = iMenu(0,app.roleData.wmenu[0]);
      Object.assign(pageData,that.banner.nData,that.articles.nData);
      let mPage = that.articles.nIndex.concat(app.articles.nIndex);
      that.setData({
        statusBar: app.sysinfo.statusBarHeight,
        wWidth: app.sysinfo.windowWidth / 3,
        pageCk: pageData[mPage[0]].afamily,
        mSwiper: that.banner.nIndex.concat(app.banner.nIndex),
        mPage,
        pageData,
        grids
      },resolve(true));
    }).then(() => {
      loginAndMenu(app.roleData).then(rData => {
        let succPage = { unAuthorize: true }
        if (rData){             //用户已授权
          succPage.unAuthorize = false;
          if (app.roleData.wmenu[0].toString() != rData.wmenu[0].toString()) {
            succPage.grids = iMenu(0, rData.wmenu[0]);           //菜单有变化
          };
          app.roleData = rData;
          if (app.roleData.user.line != 9) { wx.showTabBar() };
        };
        wx.setStorageSync('__plugins_/wx4b1c27ae1940d4fd/roleData', app.roleData)
        that.banner.upData().then(banner=>{
          if (banner) {
            Object.assign(succPage, that.banner.addViewData(banner,'mSwiper') );
          };
          that.articles.upData().then(artData=>{
            if (artData){
              Object.assign(succPage, that.articles.addViewData(artData,'mPage'))
            };
            that.setData(succPage)
          })
        });
      })
    }).catch(loginerr=>{
      app.logData.push([Date.now(),JSON.stringify(loginerr)]);
    });
  },

  userInfoHandler: function (e) {
    var that = this;
    openWxLogin().then( mstate=> {
      app.roleData = mstate;
      app.logData.push([Date.now(), '用户授权' + JSON.stringify(app.sysinfo)]);     //用户授权时间记入日志
      that.setData({ unAuthorize: false, grids: iMenu(0,app.roleData.wmenu[0]) })
    }).catch( console.error );
  },

  tabClick: tabClick,

  onPullDownRefresh: function () {
    this.articles.upData().then(aSetData={
      if (aSetData) {
        this.articles.addViewData(aSetData,'mPage')
      }
    });
  },

  onReachBottom: function () {
    this.articles[this.data.pageCk].downData().then(aSetData={
      if (aSetData) {
        this.articles.addViewData(aSetData,'mPage')
      }
    });
  },

  onUnload() {
    let banner = {nData: that.banner.nData};
    let articles = {nData: that.articles.nData};
    banner[this.banner.filterId] = that.banner.nIndax;
    articles[this.articles.filterId] = that.articles.nIndax;
    wx.setStorage({ key: "banner", data: banner });
    wx.setStorage({ key: 'articles', data: articles });
  },

  onShareAppMessage: shareMessage    // 用户点击右上角分享

})

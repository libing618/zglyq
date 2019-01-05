import {tabClick,shareMessage} from '../../libs/util.js';
const { iMenu, loginCloud, getData, openWxLogin } = requirePlugin('lyqPlugin');
var app = getApp();
function loginAndMenu(roleData) {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success:(res)=> {
        if (res.authSetting['scope.userInfo']) {            //用户已经同意小程序使用用户信息
          wx.getStorage({
            key: 'roleData',
            success: function (res) {
              resolve(res.data)
            },
            fail: function(){
              resolve(roleData)
            }
          })
        } else { resolve(roleData) }
      },
      fail: (resFail) => { reject('用户没有授权登录') }
    })
  }).then(rData=>{
    return new Promise((resolve, reject) => {
      loginCloud(1).then(reData=>{
        wx.getUserInfo({        //检查客户信息
          withCredentials: false,
          lang: 'zh_CN',
          success: function ({ userInfo }) {
            if (userInfo) {
              let updateInfo = false,gData={};
              for (let iKey in userInfo) {
                if (userInfo[iKey] != reData.user[iKey]) {             //客户信息有变化
                  updateInfo = true;
                  reData.user[iKey] = userInfo[iKey];
                  gData[iKey] = userInfo[iKey];
                }
              };
              if (updateInfo) {
                db.collection('_User').doc(reData.user._id).update({
                  data: gData
                }).then(() => {
                  resolve(reData);
                })
              } else {
                resolve(reData);
              };
            }
          }
        });
      })
    });
  }).catch((loginErr) => { reject('系统登录失败:' + JSON.stringify(loginErr)) });
};
Page({
  data: {
    autoplay: true,
    pNo: 'articles',                       //文章类信息
    fLength: 4,                       //nav文字数
    pageCk:1,
    tabs: ["品牌建设", "政策扶持", "我的商圈"]
  },

  onLoad: function () {
    var that = this;
    let grids;
    wx.hideTabBar();
    let pageData = require('../../test/articles').banner;
    Object.assign(pageData, require('../../test/articles').articles);
    that.banner = new getData('banner');
    that.articles = []
    for (let i = 0; i < 3; i++) {
      that.articles.push(new getData('articles', i))
      app.aIndex.articles[i] = that.articles[i].nIndex.concat(app.aIndex.articles[i])
    };
    return new Promise((resolve,reject)=>{
      grids = iMenu(0,app.roleData.wmenu[0]);
      for (let i = 0; i < 3; i++) {Object.assign(pageData,that.articles[i].nData)}
      that.setData({
        statusBar: app.sysinfo.statusBarHeight,
        wWidth: app.sysinfo.windowWidth / 3,                      //每个nav宽度
        pageCk: app.aIndex.pCkarticles ? app.aIndex.pCkarticles : that.data.pageCk,
        mSwiper: that.banner.nIndex.concat(app.aIndex.banner),
        mPage: that.articles.map(a=>{return a.nIndex}),
        pageData,
        grids: grids
      },resolve(true));
    }).then(() => {
      loginAndMenu(app.roleData).then(rData => {
        let succPage = { unAuthorize: false }
        if (app.roleData.wmenu[0].toString() != rData.wmenu[0].toString()) {
          succPage.grids = iMenu(0, rData.wmenu[0]);
          succPage.grids[0].mIcon = rData.user.avatarUrl;   //把微信头像地址存入第一个菜单icon
        };
        app.roleData = rData;
        wx.setStorageSync('roleData', rData)
        if (app.roleData.user.line != 9) { wx.showTabBar() };
        let firstPage = [
          that.banner.upData().then(banner=>{
            Object.assign(succPage, that.banner.addViewData(banner,'mSwiper') );
          })
        ];
        that.articles.forEach((article,i)=>{
          firstPage.push(
            article.upData().then(artData=>{
              Object.assign(succPage, article.addViewData(artData,'mPage['+i+']'))
            })
          )
        });
        Promise.all(firstPage).then(()=>{
          that.setData(succPage)
        });
      })
    }).catch(loginerr=>{
      app.logData.push([Date.now(),JSON.stringify(loginerr)]);
      that.setData({
        unAuthorize: true
      });
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
    this.articles[this.data.pageCk].upData().then(aSetData={
      if (aSetData) {
        this.setData( this.articles[this.data.pageCk].addViewData(aSetData,'mPage['+this.data.pageCk+']') )
      }
    });
  },

  onReachBottom: function () {
    this.articles[this.data.pageCk].downData().then(aSetData={
      if (aSetData) {
        this.setData( this.articles[this.data.pageCk].addViewData(aSetData,'mPage['+this.data.pageCk+']') )
      }
    });
  },

  onUnload() {
    app.aIndex['pCk'+this.data.pNo] = Number(this.data.pageCk);
  },

  onShareAppMessage: shareMessage    // 用户点击右上角分享

})

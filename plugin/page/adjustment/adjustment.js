//调整当日成品生产计划
import {hTabClick} from '../../modules/frequently';
import {checkRols} from '../../modules/initForm';
const docDefine = require('../../modules/procedureclass').prodesign;
const db = wx.cloud.database();
const _ = db.command;
const sysinfo = wx.getStorageSync('sysinfo');
const roleData = wx.getStorageSync('roleData');

Page({
  data: {
    pNo: 'prodesign',                       //流程
    statusBar: sysinfo.statusBarHeight,
    ht:{
      navTabs: docDefine.afamily,
      fLength: docDefine.afamily.length,
      tWidth: 470 * sysinfo.rpxTopx / 3,   //每个tab宽度470rpx÷3
      twwHalf: 48 * sysinfo.rpxTopx,
      pageCk: 0
    },
    cPage: [],
    pageData: {},
  },

  onLoad: function (ops) {        //传入参数为pNo
    var that = this;
    if (checkRols(1,roleData.user)) {  //检查用户操作权限
      updateTodo('prodesign');
    };
  },

  updateTodo: function(pNo) {    //更新页面显示数据
    var that = this;
    return new Promise((resolve, reject) => {
      var umdata = new Array(docDefine.afamily.length);
      umdata.fill([]);
      var unitId = uId ? uId : roleData.uUnit._id;
      db.collection(pNo).where({
        unitId:unitId,                //除权限和文章类数据外只能查指定单位的数据
        startTime: _.gt(new Date()),
        endTime: _.lt(new Date())          //查询本地最新时间后修改的记录
      }).orderBy('updatedAt','asc')           //按更新时间升序排列
      .find().then(({data}) => {
        var lena = data.length;
        if (lena > 0) {
          let aProcedure,aData = {};
          for (let i = 0; i < lena; i++) {
            aProcedure = data[i].toJSON();
            umdata[aProcedure.afamily].unshift(aProcedure._id);
            aData[aProcedure._id] = aProcedure;                        //将数据对象记录到本机
          };
          that.setData({
            cPage: umdata,
            pageData: aData
          })
        };
        resolve(lena > 0);               //数据更新状态
      }).catch(error => {
        if (!that.netState) { wx.showToast({ title: '请检查网络！' }) }
      });
    }).catch(console.error);
  },
  hTabClick: hTabClick,

  onPullDownRefresh: function () {                   //更新缓存以后有变化的数据
    updateTodo('prodesign');
  },
  onReachBottom: function () {
    updateTodo('prodesign');
  }
})

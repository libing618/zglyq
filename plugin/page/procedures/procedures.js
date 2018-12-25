//审批流程列表
import {hTabClick} from '../../index.js';
import { shareMessage,checkRols } from '../../modules/initForm';
const db = wx.cloud.database();
var app = getApp();

Page({
  data:{
    pClassName: {},
    statusBar: app.sysinfo.statusBarHeight,
    ht: {
      navTabs: ['待我审', '我已审', '已发布'],
      tWidth: 470 * app.sysinfo.rpxTopx / 3,   //每个tab宽度470rpx÷3
      fLength: 3,
      twwHalf: 48 * app.sysinfo.rpxTopx,   //每个tab字体宽度一半32rpx*3÷2
      pageCk: 0
    },
    tabExplain: ['需要您审批', '在他人审批过程中', '可供查阅'],
    pTotal: [0,0,0],
    pageData: {},
    pAt:[[new Date(0),new Date(0)],[new Date(0),new Date(0)]],  //缓存中处理中流程更新时间
    prodessing: [[],[]],              //流程分类缓存数组
    procedures: {},              //已发布流程缓存数组
    proceduresCk: 'goods'             //选中的已发布流程
  },

  onLoad:function(options){
    if (checkRols(app.roleData.user.line == 9 ? -1 : app.roleData.user.line,app.roleData.user) ){
      return new Promise((resolve,reject)=>{
        wx.getStorage({
          key: 'procedures',
          success: function (res) {
            if (res.data) {
              resolve(res.data)
            } else { resolve( {} ) };
          }
        })
      }).then( pSetData=>{
        let docsDefine = require('../../modules/procedureclass');
        for (let procedure in docsDefine) {
          pSetData.pClassName.push(procedure);
          pSetData.processName[procedure] = docsDefine[procedure].pName;
          if (!this.data.procedures[procedure]) {
            pSetData.procedures[procedure]=[];
            pSetData.proceduresAt[procedure]=[new Date(0),new Date(0)];
          }
        };
        this.updatepending(true,0).then(usData=>{
          if (usData){
            Object.assign(pSetData,usData)
          };
          this.setData(pSetData);
        })
      })
    };
  },

  hTabClick: function({currentTarget:{id,dataset},detail:{value}}){
    this.setData({
      "ht.pageCk": Number(id)
    },()=>{
      this.updatepending(true).then(pSetData={
        if (pSetData) {this.setData(pSetData)}
      });
    });
  },

  anClick: function(e){                           //选择审批流程类型
    this.setData({ proceduresCk: e.currentTarget.id });
    this.updatepending(true).then(pSetData={
      if (pSetData) {this.setData(pSetData)}
    })
  },

  updatepending: function(isDown, pck = this.data.ht.pageCk){   //更新数据(true上拉刷新，false下拉刷新)
    var that=this;
    return new Promise((resolve,reject) =>{
      if (isDown || (!isDown && that.data.pTotal[pck]>0) ){
        wx.cloud.callFunction({
          name:'process',
          data:{
            pModel: that.data.proceduresCk,
            sData:{
              rDate: pck==2 ? that.data.pAt[that.data.proceduresCk] : that.data.pAt[pck],
              isDown: isDown ? 'asc' : 'desc',
              lastTotal: that.data.pTotal[pck]
            },
            processOperate: pck    //操作类型(0待我审,1处理中,2已结束)
          }
        }).then(({result}) => {
          that.data.pTotal[pck] = result.total;
          let uSetData = {pTotal: that.data.pTotal};
          let lena = result.records.length ;
          if (lena>0){
            let aprove = {}, aPlace = -1;
            if (pck==2) {                   //已发布
              uSetData.proceduresAt = { $(that.data.proceduresCk):that.data.proceduresAt[that.data.proceduresCk] };
              uSetData.procedures = {$(that.data.proceduresCk):that.data.procedures[that.data.proceduresCk]};
              if (isDown) {                     //下拉刷新
                uSetData.proceduresAt[that.data.proceduresCk][1] = result.records[lena-1].updatedAt;       //更新本地最新时间
                uSetData.proceduresAt[that.data.proceduresCk][0] = result.records[0].updatedAt;         //更新本地最后更新时间
              } else {
                uSetData.proceduresAt[that.data.proceduresCk][0] = result.records[lena - 1].updatedAt;          //更新本地最后更新时间
              };
              result.records.forEach( aprove =>{              //dProcedure为审批流程的表名
                if (isDown) {                               //各类审批流程的ID数组
                  aPlace = uSetData.procedures[that.data.proceduresCk].indexOf(aprove._id)
                  if (aPlace >= 0) { uSetData.procedures[that.data.proceduresCk].splice(aPlace, 1) }           //删除本地的重复记录列表
                  uSetData.procedures[that.data.proceduresCk].unshift(aprove._id);                   //按流程类别加到管理数组中
                } else {
                  uSetData.procedures[that.data.proceduresCk].push(aprove._id);                   //按流程类别加到管理数组中
                };
                uSetData['pageData.'+aprove._id] = aprove;                  //增加页面中的新收到数据
              });
            } else {
              uSetData.pAt = that.data.pAt;
              uSetData.processing = that.data.processing;
              if (isDown) {                     //下拉刷新
                uSetData.pAt[pck][1] = result.records[lena-1].updatedAt;                          //更新本地最新时间
                uSetData.pAt[pck][0] = result.records[0].updatedAt;                 //更新本地最后更新时间
              } else {
                uSetData.pAt[pck][0] = result.records[lena - 1].updatedAt;
              };
              result.records.forEach( aprove =>{              //dProcedure为审批流程的表名
                if (isDown) {                               //审批流程的ID数组
                  aPlace = uSetData.processing[pck].indexOf(aprove._id);
                  if (aPlace >= 0) { uSetData.procedures[pck].splice(aPlace, 1) }           //删除本地的重复记录列表
                  uSetData.processing[pck].unshift(aprove._id);                   //按流程类别加到管理数组中
                } else {
                  uSetData.processing[pck].push(aprove._id);                   //按流程类别加到管理数组中
                };
                uSetData['pageData.'+aprove._id] = aprove;     //pageData是ID为KEY的JSON格式的审批流程数据
              });
            };
          }
          resolve( uSetData );
        }).catch( console.error );
      } else {
        resolve(false)
      }
    })
   },

  onPullDownRefresh: function () {
    this.updatepending(true).then(pSetData={
      if (pSetData) {this.setData(pSetData)}
    });
  },

  onReachBottom: function () {
    this.updatepending(false).then(pSetData={
      if (pSetData) {this.setData(pSetData)}
    });
  },

  onHide: function () {             //进入后台时缓存数据。
    wx.getStorageInfo({             //查缓存的信息
      success: function (res) {
        if (res.currentSize < (res.limitSize - 512)) {          //如缓存占用大于限制容量减512kb，将大数据量的缓存移除。
          wx.setStorage({
            key: 'procedures',
            data: {
              pageData: that.data.pageData,
              pAt:that.data.pAt,
              prodessing: that.data.prodessing,
              proceduresAt: that.data.proceduresAt,
              procedures: that.data.procedures,
              proceduresCk: that.data.proceduresCk
            }
          });
        }
      }
    });
  },

  onShareAppMessage: shareMessage
})

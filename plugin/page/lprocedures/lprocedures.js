import {shareMessage} from '../../modules/initForm';
var app = getApp()
Page ({
  data: {
    pNo: '',                       //流程
    statusBar: app.sysinfo.statusBarHeight,
    mPage: [],                 //页面管理数组
    artId: 0,             //已建数据的ID作为修改标志，则为新建
    pageData: []
  },

  onLoad: function (ops) {        //传入参数为pNo,不得为空
    var that = this;
    let artid = Number(ops.artId);
    let docDefine = require('../../modules/procedureclass')[ops.pNo];
    that.setData({
      pNo: ops.pNo,
      artId: isNaN(artid) ? ops.pNo : artid,
      navBarTitle: isNaN(artid) ? docDefine.pName : docDefine.pName+'--'+docDefine.afamily[artid]
    });
  },

  onShareAppMessage: shareMessage
})

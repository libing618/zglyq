import {shareMessage} from '../../modules/initForm';
import {getData} from '../../modules/db-data';
const sysinfo = wx.getStorageSync('sysinfo');
Page ({
  data: {
    pNo: '',                       //流程
    statusBar: sysinfo.statusBarHeight,
    mPage: [],                 //页面管理数组
    fn: -1,             //已建数据的ID作为修改标志，则为新建
    pageData: []
  },

  onLoad: function (ops) {        //传入参数为pNo,不得为空
    var that = this;
    let fn = Number(ops.fn);
    let docDefine = require('../../modules/procedureclass')[ops.pNo];
    that.gData = new getData(that.data.dataname, that.data.afamily, that.data.filterId)
    that.gData.gStorage().then(()=> {
      if (that.gData.aIndex.indArr.length>0){
        let aData = {};
        that.gData.aIndex.indArr.forEach(mId=>{ aData[mId]=that.gData.aData[mId] })
        that.setData({
          pNo: ops.pNo,
          fn: isNaN(fn) ? -1 : fn,
          navBarTitle: isNaN(fn) ? docDefine.pName : docDefine.pName+'--'+docDefine.afamily[fn],
          mPage: that.gData.aIndex.indArr,
          pageData: aData
        });
        that.gData.upData().then(topItem=>{
          that._addViewData(topItem)
        })
      }
    })
  },

  createProcedure(){
    var that = this;
    let url='/plugin-private://wx4b1c27ae1940d4fd/page/fprocedure?pNo='+that.data.pno+(that.data.fn==-1 ? '' : '&fn='+that.data.fn);
    wx.navigateTo({ url: url});
  }
})

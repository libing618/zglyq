//流程审批模块
const db = wx.cloud.database();
const sysinfo = wx.getStorageSync('sysinfo');
const roleData = wx.getStorageSync('roleData');
Page({
  data:{
    statusBar: sysinfo.statusBarHeight,
    uIdearArray: ['通 过', '退回发起人 ','废 弃' ],
    cResult: -1,
    pBewrite: '',
    aprvClicked: [true,true,false]
  },

  onLoad:function(options){
    var that = this;
    let nPages = getCurrentPages();
    let prePage = nPages[nPages.length-2].data.pageData;
    let pData =peePage[options.approveId];
    let procedureClass = require('../../modules/procedureclass')[pData.dProcedure];
    pData.dObject.unitId = pData.unitId;
    that.setData({
      ...procedureClass,
      ...pData,
      enEdit: roleData.uUnit._id==pData.unitId,          //本单位的流程允许编辑
      afamilys: procedureClass.afamily ? procedureClass.afamily : false,                              //流程内容分组
      cmLength: pData.cManagers.length    //流程审批节点长度
    });
    // pSuccess: procedureClass.pSuccess,
    // fieldType: procedureClass.fieldType,      //流程内容格式
    // navBarTitle: procedureClass.pName,     //将页面标题设置成流程名称
    // pBewrite: procedureClass.pBewrite,     //流程说明
    // dProcedure: pData.dProcedure,         //流程写入的数据表名
    // aValue: pData,        //流程缓存
    // processState: pData.processState,
  },

  aprvClick: function(e){
    let i = parseInt(e.currentTarget.id.substring(3))      //选择审批流程类型的数组下标
    this.data.aprvClicked[i] = ! this.data.aprvClicked[i];
    this.setData({ aprvClicked: this.data.aprvClicked })
  },

  resultChange: function(e){
    var that = this;
    var nInstace = Number(that.data.cInstance);
	  switch (e.detail.value) {
      case "0":
        nInstace++;
        if (nInstace==that.data.cmLength) {
          that.data.processState=2
        } else {
          that.data.processState=1
        };
        break;
      case "1":
        nInstace=0;
        that.data.processState=0;
        break;
      case "2":
        nInstace=that.data.cmLength;
        break;
    };
    that.setData({
      processState: that.data.processState,
      cResult:Number(e.detail.value),
      "cInstance":nInstace
    })
  },

  fsave:function(e) {                         //保存审批意见，流向下一节点
    var that = this;
    var nInstace = Number(that.data.cInstance);        //下一流程节点
    if (nInstace>=0) {
      return new Promise((resolve, reject) => {
        if ( nInstace==that.data.cmLength && that.data.processState == 2 ){   //最后一个节点审批通过
          let scData = {
            dProcedure: that.data.dProcedure,
            dObjectId: that.data.dObjectId,
            sData: that.data.dObject
          };
          if (that.data.dProcedure !== '_Role') {            //是否单位审批流程
            scData.sData.unitId = that.data.unitId;
            scData.sData.unitName = that.data.unitName;
          }
          return new Promise((resolve, reject) => {
            if (that.data.dObjectId=='0') {       //新建数据
              resolve( db.collection(that.data.dProcedure).add({data:scData.sData}) );
            } else {       //修改数据
              scData.processOperate = 4
              resolve( wx.cloud.callFunction({ name:'process', data:scData }) )
            };
          }).then((sd)=>{
              wx.showToast({ title: '审批内容已发布', duration:2000 });
              resolve(sd);
          }).catch((error)=>{
            wx.showToast({ title: '审批内容发布出现错误'+error.error, duration: 2000 });
            reject(error);
          })
        } else { resolve(false) };
      }).then(processEnd=>{
        let cApproval = {
          processState: that.data.processState,                //流程节点
          cInstance: nInstace,             //下一处理节点
          cFlowStep: nInstace == that.data.cmLength ? ['流程结束'] : that.data.cManagers[nInstace][0]  //下一流程审批人
        };
        if (processEnd) { cApproval.dObjectId = sObjectId }
        let uIdear = that.data.dIdear;
        uIdear.unshift({ un: roleData.user.uName, dt: new Date(), di:that.data.uIdearArray[that.data.cResult] , dIdear:e.detail.value.dIdear })
        cApproval.dIdear = uIdear;       //流程处理意见
        cApproval.processUser = that.data.processUser+','+roleData.user._id;
        wx.cloud.callFunction({
          name: 'process',
          data: {
            pModel: 'sengpi',
            dObjectId: that.data._id,
            sData: cApproval,
            processOperate: 3
          }
        }).then(function () {
          wx.showToast({ title: '流程已提交,请查询结果。', duration: 2000 }) // 保存成功
          setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000);
        })
      }).catch(console.error);
    } else {
      wx.showToast({title: '请进行审批处理', duration: 2500, icon: 'loading'})
    }
  },

})

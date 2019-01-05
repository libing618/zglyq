// 通用的内容编辑pages
import {initData} from '../../modules/initForm';
import {noEmptyObject} from '../../modules/frequently';
const wImpEdit = require('../../modules/impedit.js');
const sysinfo = wx.getStorageSync('sysinfo');

Page({
  data: {
    navBarTitle: '编辑--',              //申请项目名称
    statusBar: sysinfo.statusBarHeight,
    selectd: -1,                       //详情项选中字段序号
    enIns: true,                  //插入grid菜单组关闭
    targetId: '0',              //流程申请表的ID
    dObjectId: '0',             //已建数据的ID作为修改标志，0则为新建
    vData: {},
    fieldType: {},
    fieldName: []
  },
  onLoad: function (options) {        //传入参数为tgId或pNo/fn,不得为空
    var that = this;
    let aaData={};
    let roleData = wx.getStorageSync('roleData');
    that.data.uEV = (roleData.user.line!=9);            //用户已通过单位和职位审核
    return new Promise((resolve, reject) => {
      if (typeof options.tgId == 'string') {                   //传入参数含审批流程ID，则为编辑审批中的数据
        let nPages = getCurrentPages();
        let prePage = nPages[nPages.length-2];
        if (prePage.data.dObject) {
          aaData = prePage.data.dObject;
          that.data.targetId = options.tgId;
          resolve({pNo:prePage.data.dProcedure,pId:prePage.data.dObjectId});
        } else { reject() };
      } else {
        let fn = Number(options.fn);
        resolve({ pNo: options.pNo, pId: isNaN(fn) ? -1 : fn });
      }
    }).then(ops=>{
      let docDefine = require('../../modules/procedureclass')[ops.pNo];
      switch (typeof ops.pId){
        case 'number':           //传入参数为一位数字的代表该类型新建数据或读缓存数据
          if (pId==-1){
            that.data.dObjectId = ops.pNo;
            that.data.navBarTitle += docDefine.pName;
          } else {
            that.data.dObjectId = ops.pNo + ops.pId;      //根据类型建缓存KEY
            that.data.navBarTitle += docDefine.afamily[ops.pId]
          }
          break;
        case 'string':                   //传入参数为已发布ID，重新编辑已发布的数据
          that.data.dObjectId = ops.pId;
          that.data.navBarTitle += docDefine.pName;
          break;
        default:
      }
      let fieldName = docDefine.pSuccess;
      let fieldType = docDefine.fieldType;
      fieldName.unshift("uName");
      fieldType.uName = {t:"h2", p:"名称" };
      aaData = initData(fieldName,fieldType,aaData);    //require('../../test/goods0')[0]
      wImpEdit.initFunc(ops.pNo).forEach(functionName => {
        that[functionName] = wImpEdit[functionName];
        if (functionName == 'i_eDetail') {             //每个输入类型定义的字段长度大于3则存在对应处理过程
          that.m_touchend = wImpEdit.m_touchend;
          that.m_touchmove = wImpEdit.m_touchmove;
          if (! noEmptyObject(aaData)){            //数据对象是否为空
            aaData.eDetail = [                     //内容部分定义：t为类型,e为文字或说明,c为媒体文件地址或内容
              { t: "rT", e:"大标题",r:"2110D9D9D9ECECEC"},
              { t: "re", e:"正文简介",r:"3002D9D9D9ECECEC"},
              { t: "rT", e:"中标题",r:"3110D9D9D9ECECEC"},
              { t: "re", e:"正文",r:"3002D9D9D9ECECEC"},
              { t: "rT", e:"1、小标题",r:"4110D9D9D9ECECEC"},
              { t: "re", e:"图片文章混排",r:"4002D9D9D9ECECEC"},
              { t: "-1", e:"图片内容.png",r:"4010D9D9D9ECECEC"},
              { t: "re", e:"正文",r:"4002D9D9D9ECECEC"},
              { t: "rT", e:"2、小标题",r:"4110D9D9D9ECECEC"},
              { t: "re", e:"音频文章混排",r:"4002D9D9D9ECECEC"},
              { t: "-3", e:"录音内容说明",r:"4010D9D9D9ECECEC"},
              { t: "re", e:"正文",r:"4002D9D9D9ECECEC"},
              { t: "rT", e:"3、小标题",r:"4110D9D9D9ECECEC"},
              { t: "re", e:"视频文章混排",r:"4002D9D9D9ECECEC"},
              { t: "-4", e:"视频内容说明",r:"4010D9D9D9ECECEC"},
              { t: "re", e:"正文",r:"4002D9D9D9ECECEC"},
              { t: "re", e:"章节结尾",r:"4002D9D9D9ECECEC"},
              { t: "re", e:"文章结尾",r:"4002D9D9D9ECECEC"}
            ]
          }
        }
      });
      that.setData({
        pNo: ops.pNo,
        navBarTitle: that.data.navBarTitle,
        fieldName: fieldName,
        vData: aaData
      });
    }).catch((error)=>{
      console.log(error)
      wx.showToast({ title: '数据传输有误',icon:'loading', duration: 2500 });
      setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000);
    });
  },

  fSubmit: wImpEdit.fSubmit

})

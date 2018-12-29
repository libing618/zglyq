//显示数据的关键要素
import {initData} from '../../modules/initForm';
const roleData = wx.getStorageSync('roleData');
var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior],
  relations: {
    '../field-view/field-view': {
      type: 'child'                // 关联的目标节点应为子节点
    }
  },
  properties: {
    pno: {
      type: String,
      value: 'goods'
    },
    sitem: Object
  },
  options: {
    addGlobalClass: true
  },

  data: {
    fieldName: [],
    fieldType: {},
    uEV: roleData.user.line!=9,    //用户已通过单位和职位审核
    enUpdate: false,
    vData:{},
    scale: 0,
    csupply: 0
  },

  lifetimes:{
    attached: function(){

    }
  },

  methods:{
    clickitem(e){
      let docDefine = require('../../modules/procedureclass')[this.data.pno];
      this.setData({
        fieldName: docDefine.pSuccess,
        fieldType: docDefine.fieldType,
        inFamily: typeof docDefine.afamily != 'undefined',
        vData: initData(docDefine.pSuccess, docDefine.fieldType, this.data.sitem),
        enUpdate: this.data.sitem.unitId==roleData.uUnit._id && typeof docDefine.suRoles!='undefined'
      });
      this.popModal();
    },

    fEditProcedure(e){
      var that = this;
      let url='/plugin-private://wx4b1c27ae1940d4fd/page/fprocedure?pNo='+that.data.pno;
      switch (e.currentTarget.id){
        case 'fModify' :
          url += '&artId='+that.data.vData._id;
          break;
        case 'fTemplate' :
          let newRecord = that.data.inFamily ? that.data.pno+that.data.vData.afamily : that.data.pno;
          let aData = wx.getStorageSync(that.data.pno) || {};
          url += that.data.inFamily ? '&fn='+that.data.vData.afamily : '';
          url += '&artId='+newRecord;
          aData[newRecord] = that.data.vData
          wx.setStorage({key:that.data.pno,data: aData});
          break;
      };
      this.downModal();
      wx.navigateTo({ url: url});
    }
  }

})

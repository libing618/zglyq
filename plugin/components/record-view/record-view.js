//显示数据的关键要素
import {initData} from '../../modules/initForm';
var app = getApp()
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
    uEV: app.roleData.user.line!=9,    //用户已通过单位和职位审核
    enUpdate: false,
    vData:{},
    scale: 0,
    csupply: 0
  },

  lifetimes:{
    attached: function(){
      switch (this.data.pno) {
        case 'goods':
          if (app.cargoStock) {      //[this.data.sitem._id]
            cargototal = app.cargoStock[this.data.sitem._id]
            this.setData({
              scale: ((cargototal.payment + cargototal.delivering + cargototal.delivered) / cargototal.packages).toFixed(0),
              csupply: (cargototal.canSupply / cargototal.packages - 0.5).toFixed(0)
            });
          }
          break;
        default:
          break;
      }
    }
  },

  methods:{
    clickitem(e){
      let docDefine = require('../../modules/procedureclass')[this.data.pno];
      this.setData({
        fieldName: docDefine.pSuccess,
        fieldType: docDefine.fieldType,
        inFamily: typeof docDefine.afamily != 'undefined'
        vData: initData(docDefine.pSuccess, docDefine.fieldType, this.data.sitem),
        enUpdate: this.data.sitem.unitId==app.roleData.uUnit._id && typeof docDefine.suRoles!='undefined'
      });
      this.popModal();
    },

    fEditProcedure(e){
      var that = this;
      var url='/pluginPage/fprocedure/fprocedure?pNo='+that.data.pno;
      switch (e.currentTarget.id){
        case 'fModify' :
          url += '&artId='+that.data.vData._id;
          break;
        case 'fTemplate' :
          url += that.data.inFamily ? '&artId='+that.data.vData.afamily : '';
          let newRecord = that.data.inFamily ? that.data.pno+that.data.vData.afamily : that.data.pno;
          app.aData[that.data.pno][newRecord] = that.data.vData;
          break;
      };
      this.downModal();
      wx.navigateTo({ url: url});
    }
  }

})

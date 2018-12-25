//顺序切换分类数据
import {afamilySwitchSave} from '../../modules/db-get-data';
var app = getApp()
var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior],
  properties: {
    name: {
      type: String,
      value: 'goods',
    },
    value: Object
  },
  options: {
    addGlobalClass: true
  },

  data: {
    fieldName: [],
    fieldType: {}
  },

  lifetimes:{
    attached: function(){
      switch (this.data.name) {
        case 'cargo':
          cargototal = app.cargoStock[this.data.value._id]
          this.data.setData({
            scale: ((cargototal.payment + cargototal.delivering + cargototal.delivered) / cargototal.packages).toFixed(0),
            csupply: (cargototal.canSupply / cargototal.packages - 0.5).toFixed(0)
          });
          break;
        default:
      }
    },
  },

  methods: {
    clickitem({ currentTarget:{id,dataset},detail:{value} }){            //切换选择弹出页
      if (id==this.data.value._id){
        this.setData({
          fieldName: app.fData[this.data.name].pSuccess,
          fieldType: app.fData[this.data.name].fieldType,
          smtName: app.fData[this.data.name].afamily
        });
        this.popModal()
      }
    },
    fSwitch(){                  //确认切换到下一数组并返回
      let that = this;
      let arrNext = (that.data.value.afamily + 1) == that.data.smtName.length ? 0 : (that.data.ht.pageCk + 1);
      afamilySwitchSave(that.data.name,that.data.clickid,arrNext).then(()=>{
        that.setData({'value.afamily': arrNext});
        that.downModal();
      })
    }
  }
})

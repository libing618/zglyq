//顺序切换分类数据
import {afamilySwitchSave} from '../../modules/db-get-data';
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
    },
  },

  methods: {
    clickitem({ currentTarget:{id,dataset},detail:{value} }){            //切换选择弹出页
      if (id==this.data.value._id){
        let docDefine = require('../../modules/procedureclass')[this.data.name];
        this.setData({
          fieldName: docDefine.pSuccess,
          fieldType: docDefine.fieldType,
          smtName: docDefine.afamily
        });
        this.popModal()
      }
    },
    fSwitch(){                  //确认切换到下一数组并返回
      let that = this;
      let arrNext = (that.data.value.afamily + 1) == that.data.smtName.length ? 0 : (that.data.value.afamily + 1);
      afamilySwitchSave(that.data.name,that.data.clickid,arrNext).then(()=>{
        that.setData({'value.afamily': arrNext});
        that.downModal();
      })
    }
  }
})

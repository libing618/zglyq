import {cargoStock} from '../../modules/db-get-data.js';
var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior],
  properties: {
    pno: {
      type: String,
      value: 'goods',
    },
    id: {
      type: String,
      value: '0'
    },
    sitem: {type: Object},
    clickid: {
      type: String,
      value: '0'
    }
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
      switch (this.data.pno) {
        case 's_cargo':
          cargototal = cargoStock[this.data.sitem._id]
          this.setData({

          });
          break;
        default:
      }
    },
  },

  methods: {
    shareOrder(){
      if (this.data.clickid==this.data.sitem._id){
        let docDefine = require('../../modules/procedureclass')[this.data.name];
        this.
        this.setData({
          fieldName: docDefine.pSuccess,
          fieldType: docDefine.fieldType
        });
        this.popModal()
      } else {
        let clickEventDetail = {itemid:this.data.sitem._id};
        this.triggerEvent('clickeditem',clickEventDetail)
      }
    },
    fSave(){

    }
  }
})

var modalBehavior = require('../utils/poplib.js')
Component({
  behaviors: [modalBehavior，'wx://form-field'],
  properties: {
    name: {
      type: String,
      value: 'goods',
    },
    editable: {
      type: Number,
      value: 0
    },
    value: Array,
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

  methods: {
    fenins({ currentTarget:{id,dataset},detail:{value} }){            //字段内容查看弹出页
      if (this.data.clickid==this.data.sitem._id){
        let docDefine = require('../../modules/procedureclass')[this.data.name]
        this.setData({
          fieldName: docDefine.pSuccess,
          fieldType: docDefine.fieldType
        });
        this.popModal();
        if (this.data.name=='goods') {
          cargototal = cargoStock[this.data.value._id]
          this.data.setData({
            scale: ((cargototal.payment + cargototal.delivering + cargototal.delivered) / cargototal.packages).toFixed(0),
            csupply: (cargototal.canSupply / this.data.value[id].packages - 0.5).toFixed(0)
          });
        }
      }
    }
  }
})

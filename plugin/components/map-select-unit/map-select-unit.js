var modalBehavior = require('../utils/poplib.js');
const {geoQueryUnit} = require('../../modules/db-data');
var mapBahavior = require('../utils/mapAnalysis.js');   //位置授权及解析
const roleData = wx.getStorageSync('roleData');
Component({
  behaviors: [modalBehavior,mapBahavior,'wx://form-field'],
  properties: {
    p: {
      type: String,
      value: '服务单位',
    },
    value: Object,
    name: String,
    targetTypes: String
  },
  options: {
    addGlobalClass: true
  },

  data: {
    scale: 16,
    sId: 0,
    markers:[],
    unitArray: [],
    selTypes:[]
  },

  lifetimes: {
    attached() {
      let initData = { p: this.data.p ? this.data.p : '服务单位'};
      if (!this.data.value) { initData.value = {_id:'0',uName:'点此进入地图进行选择'} };
      if (!this.data.targetTypes) {
        if (JSON.stringify(roleData.sUnit)=='{}'){
          initData.reqProIsSuperior = true;
          initData.targetTypes = '3040204';
        } else {
          initData.value = { _id: roleData.sUnit._id, uName: roleData.sUnit.uName }
        }
      }
      this.setData(initData);
    }
  },

  methods: {
    mapSelectUnit: function (e) {      //地图选择单位弹出页
      let that = this;
      let newPage={
        selTypes : that.data.targetTypes.split(',')
      };
      if ( that.data.reqProIsSuperior ) {
        wx.showToast({title:'选择服务单位，请注意：选定后不能更改！',icon: 'none'});
      };
      that.authorizeLocation(false).then(aGeoPoint =>{
        that.buildAdd(aGeoPoint).then(addGroup => {     //省级行政区划代码
          that.unitData = new geoQueryUnit(newPage.selTypes,Math.floor(addGroup.code/10000));
          that.unitData.nextGroup().then( unitdata=>{
            if (unitdata.length>0) {
              that.calDistance(aGeoPoint,unitdata).then(({markers,unitArray,points})=>{
                newPage.markers = markers;
                newPage.unitArray = unitArray;
                newPage.circles = [{
                  latitude: aGeoPoint.latitude,
                  longitude: aGeoPoint.longitude,
                  color: '#FF0000DD',
                  fillColor: '#7cb5ec88',
                  radius: 3000,
                  strokeWidth: 1
                }];
                that.setData(newPage);
                that.popModal();
                that.mapCtx = wx.createMapContext('mapSelect',that);
                that.mapCtx.includePoints({points});
              })
            } else { wx.showToast({ title: '未发现合适单位' }) }
          })
        });
      }).catch( console.error );
    },

    fSave({ currentTarget:{id,dataset},detail:{value} }){                  //确认返回数据
      if (this.data.reqProIsSuperior) {
        roleData.sUnit = this.data.unitArray[this.data.sId]
        wx.setStorage({key:'roleData', data:roleData});
        this.setData({ value: { _id: this.data.unitArray[this.data.sId]._id, uName: this.data.unitArray[this.data.sId].uName} });
      } else {
        this.setData({value:this.data.unitArray[this.data.sId]})
      };
      this.downModal()
    },

    mapMarker({ markerId }){      //点击merkers气泡
      this.setData({sId: markerId});
    },
    moveLocation({type}){                 //移动点击
      let that = this;
      switch (type){
        case 'begin':
  //        that.mapCtx.moveToLocation();
          break;
        case 'end':
          that.mapCtx.getCenterLocation({
            success: (res)=>{
              that.setData({
                latitude:res.latitude,
                longitude: res.longitude
              });
            }
          });
          break;
      }
    }
  }
})

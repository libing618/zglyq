// 供货操作
import { indexClick,binddata } from '../../modules/frequently';
import {checkRols,shareMessage} from '../../modules/initForm';
const suppliesDefine = require('../../modules/procedureclass').supplies;
const db = wx.cloud.database();
const sysinfo = wx.getStorageSync('sysinfo');
const roleData = wx.getStorageSync('roleData');
Page ({
  data: {
    pNo: 'supplies',                       //流程的序号
    mPage: [],                 //页面管理数组
    dObjectId: '0',             //已建数据的ID作为修改标志，0则为新建
    pageData: [],
    iClicked: '0',
    nowPacking:{ p: '出品包装号',t: "iSc",n:0}
  },
  subscription: {},
  indexField:'',      //定义索引字段
  sumField:'',          //定义汇总字段

  fetchData: function(oState) {
    var that = this;
    let supplieQuery = db.collection(supplies);
    supplieQuery.select(['tradeId','quantity','proName','cargo','cargoName','address','paidAt'])
    supplieQuery.ascending('paidAt');           //按付款时间升序排列
    switch (oState){
      case 0:
        supplieQuery.edoesNotExist('confirmer');      //查询确认人为空的记录
        break;
      case 1:
        supplieQuery.notEqualTo('quantity','deliverTotal');      //查询发货量不等于订单的记录
        break;
      case 2:
        supplieQuery.notEqualTo('quantity','receiptTotal');      //查询到货不等于订单的记录
        supplieQuery.greaterThan('serFamily',1);
        break;
    }
    supplieQuery.equalTo('unitId',roleData.uUnit._id);                //只能查本单位数据
    supplieQuery.limit(1000);                      //取最大数量
    const setReqData = this.setReqData.bind(this);
    return Promise.all([supplieQuery.find().then(setReqData), supplieQuery.subscribe()]).then( ([fData,subscription])=> {
      this.subscription = subscription;
      if (this.unbind) this.unbind();
      this.unbind = binddata(subscription, arp, setReqData);
    }).catch(console.error)
  },

  setReqData: function(readData){
    let pageData = {}, mPage = {}, indexList = [], aPlace = -1, iField, iSum = {}, mChecked = {},qCount = {};
    readData.forEach(onedata => {
      pageData[onedata.id] = onedata;
      iField = onedata.get(this.indexField);                  //索引字段读数据数组
      if (indexList.indexOf(iField)<0) {
        indexList.push(iField);
        mPage[iField] = [onedata.id];                   //分类ID数组增加对应ID
        iSum[iField] = onedata.get(this.sumField);
        qCount[iField] = onedata.get('quantity');
      } else {
        iSum[iField] += onedata.get(this.sumField);
        qCount[iField] += onedata.get('quantity');
        mPage[iField].push(onedata.id);
      };
      mChecked[onedata.id] = this.data.oState==0 ? true : false;
    });
    this.setData({indexList,pageData,mPage,iSum,mChecked}) ;
  },

  onLoad: function (ops) {        //传入参数为oState,不得为空
    var that = this;
    if (checkRols(suppliesDefine.ouRoles[ops.oState],roleData.user)){  //检查用户操作权限
      that.indexField = suppliesDefine.oSuccess[ops.oState].indexField;
      that.sumField = suppliesDefine.oSuccess[ops.oState].sumField;
      if (cargoStock){

        that.fetchData.bind(that) ;
        wx.setNavigationBarTitle({
          title: roleData.uUnit.nick + '的' + suppliesDefine.oprocess[ops.oState]
        });
      } else {
        wx.showToast({ title: '无库存数据！', duration: 2500 });
        setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000);
      };
    };
  },

  onUnload: function(){
    this.subscription.unsubscribe();
    this.unbind();
  },

  fSupplies: function(e){
    var that = this;
    let cargoId = e.currentTarget.id;
    let confimate = that.data.quantity[cargoId];
    let subIds = Object.keys(e.detail.value);
    let subSuppli = subIds.map(subKey=>{return that.data.pageData[subKey.substr(7)]})
    let setSingle = [];               //定义成品对象的库存数据
    that.cargoPlans[cargoId].set({
      'cargoStock':that.cargoPlans[cargoId].cargoStock-confimate,
      'payment':that.cargoPlans[cargoId].payment-confimate,
      'delivering': that.cargoPlans[cargoId].delivering + confimate })
    .save().then(savecargo=>{
      let sd = {};
      sd.cargoCanSupply[cargoId] = that.cargoPlans[cargoId].cargoStock;
      that.setData(sd);
      return db.saveAll(subSuppli)
    }).then(saveSuppli=>{

    })
  }

})

//订单统计
import { formatTime,indexClick } from '../../index';
import {checkRols,shareMessage} from '../../modules/initForm';
const db = wx.cloud.database();
const _ = db.command;
const sysinfo = wx.getStorageSync('sysinfo');
const roleData = wx.getStorageSync('roleData');

Page({
  data:{
    vData: {},
    iClicked: '0'
  },
  onLoad:function(options){
    checkRols(8,roleData.user)
  },

  onReady:function(){
    var that = this;
    that.data.vData.start_end = [formatTime(Date.now() - 864000000, true), formatTime(Date.now(), true)];
    that.sumOrders();
  },

  indexClick: indexClick,

  sumOrders:function(){
    var that = this;
    db.collection('orders').where({
      unitId: roleData.uUnit._id,
      updatedAt: _.gt(new Date(that.data.vData.sDate)).and(_.lt( new Date(that.data.vData.eDate)))
    }).count().then(orderlist=>{
      if (orderlist) {
        that.data.mPage.forEach(product=>{
          let sumPro = 0;
          that.data.specPage[product].forEach(cargo=>{
            let sumOrder = 0, specOrder = [];
            orderlist.forEach(order=>{
              if (order.cargo==cargo) {
                specOrder.push(order);
                sumOrder += order.amount};
            })
            that.data.specOrder = specOrder;
            that.data.sumspec[cargo] = sumOrder;
            sumPro += sumOrder;
          })
          that.data.sumpro[product] = sumPro;
        })
        that.setData(that.data);
      }
    }).catch(console.error);
  },

  orderquery:function(e){
    this.sumOrders();
  }

})

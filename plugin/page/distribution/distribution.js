//货架管理
import {checkRols} from '../../modules/initForm';
const db = wx.cloud.database();
const sysinfo = wx.getStorageSync('sysinfo');
const roleData = wx.getStorageSync('roleData');

Page({
  data:{
    navBarTitle: roleData.uUnit.uName+'的货架',
    statusBar: sysinfo.statusBarHeight,
    pageData: {}
  },
  onLoad:function(options){
    checkRols(8,roleData.user)
  },

  clickSave:function({currentTarget:{id}}){
    var that = this;
    let aData = wx.getStorageSync('goods');
    db.collection('goods').doc(id).update({                  //选择商品的ID
      inSale:!aData[id].inSale
    }).then(()=>{
      let aSetData = {};
      aData[id].inSale = !aData[id].inSale;
      aSetData['pageData.'+id+'.inSale'] = aData[id].inSale;
      that.setData(aSetData);
    }).catch( console.error );
  }
})

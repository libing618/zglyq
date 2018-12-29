//客户评价及统计
import {checkRols} from '../../modules/initForm';
const sysinfo = wx.getStorageSync('sysinfo');
const roleData = wx.getStorageSync('roleData');
Page({
  data:{
    mPage: [],                 //页面管理数组
    dObjectId: '0',             //已建数据的ID作为修改标志，0则为新建
    pageData: []
  },
  onLoad:function(options){          //参数oState为0客户评价1评价统计
    var that = this;
    if (checkRols(3,roleData.user)){  //检查用户操作权限
      wx.setNavigationBarTitle({
        title: roleData.uUnit.nick+'的'+ options.oState ? '评价统计' : '客户评价'
      })
    }
  }
})

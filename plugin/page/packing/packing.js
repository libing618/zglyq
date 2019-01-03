import {cosUploadFile} from '../../modules/initForm';
const sysinfo = wx.getStorageSync('sysinfo');
const roleData = wx.getStorageSync('roleData');
Page({
  data: {
    navBarTitle: '编辑--',              //申请项目名称
    statusBar: sysinfo.statusBarHeight,
    enIns: true,                  //插入grid菜单组关闭
    targetId: '0',              //流程申请表的ID
    dObjectId: '0',             //已建数据的ID作为修改标志，0则为新建
    showModalBox: false,
    animationData: {},              //弹出动画
    vData: {},
    fieldName: []
  },
  onLoad: function (options) {        //传入参数为tgId或pNo/artId
    var that = this;
    let roleData = wx.getStorageSync('roleData');
    if (checkRols(8, roleData.user)) {
      that.setData({ navBarTitle: roleData.uUnit.uName + '的产品包装'});
    }
  },
  simpleUpload:function () {
    wx.chooseImage({    // 选择文件
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success: function (res) {
          cosUploadFile(res.tempFilePaths[0]);
        }
    })
  }
})

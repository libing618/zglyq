import {noEmptyObject} from 'frequently.js';
const db = wx.cloud.database();

function requestCallback(err, data) {
  if (err && err.error) {
    wx.showModal({title: '上传文件', content: '请求失败：' + err.error.Message + '；状态码：' + err.statusCode, showCancel: false});
  } else if (err) {
    wx.showModal({title: '上传文件', content: '请求出错：' + err + '；状态码：' + err.statusCode, showCancel: false});
  } else { return data}
};

export function checkRols(ouLine,user,ouPosition){  //要求的条线，用户数据，要求的岗位
  if (user.line==8 && user.position==8){        //单位负责人
    return true;
  } else {
    let verPosition = ouPosition ? user.position==ouPosition : true ;
    if (user.line==ouLine && verPosition) {
      return true;
    } else {
      wx.showToast({ title: '权限不足请检查', duration: 2500 });
      setTimeout(function () { wx.navigateBack({ delta: 1 }) }, 2000);
      return false
    }
  }
};

export function initData(fieldName,fieldType, aData) {        //单一表记录录入或显示时数据初始化
  let vData={};
  if (noEmptyObject(aData)){            //数据对象是否为空
    fieldName.forEach(fname=> {
      if (fieldType[fname].addFields && aData[fname]) {                    //多字段组合显示或修改
        vData[fname] = {_id:aData[fname]}
        fieldType[fname].addFields.forEach(aField=>{
          if (aData[fname + '_' + aField]){vData[fname][aField] = aData[fname+'_'+aField]};
        })
      } else {
        vData[fname] = aData[fname]
      };
    });
  };
  return vData;
};

export function fileUpload(cSavePath, filePath, fe) {
  return new Promise((resolve, reject) => {
    let nameIndex = filePath.lastIndexOf("\\");
    let fileName = filePath.substring(nameIndex + 1);
    wx.showLoading({ title: '正在上传《' + fe + '》', mack: true })
    wx.cloud.uploadFile({
      cloudPath: 'f' + cSavePath + '\\' + fileName,
      filePath: filePath
    }).then(res => {
      wx.hideLoading()
      resolve(fileName)
    }).catch(e => {
      wx.hideLoading()
      wx.showToast({
        icon: 'none',
        title: '上传失败' + e.errMsg,
      })
    })
  })
}

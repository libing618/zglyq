const db = wx.cloud.database();
const _ = db.command;


export function getToken(){
  return new Promise((resolve, reject) => {
    db.collection('accessToken').orderBy('accessOverTime', 'asc').limit(1).get().then(({ data }) => {
      if (Date.now() > data[0].accessOverTime) {
        wx.cloud.callFunction({ name: 'wxcustomer', data: { customerState: 0 } }).then(sToken => { resolve(sToken.result) })
      } else {
        resolve(data[0].accessToken)
      }
    }).catch(err => { reject(err) })
  })
};

export function fileUpload(cSavePath, filePath, fe) {
  return new Promise((resolve, reject) => {
    let nameIndex = filePath.lastIndexOf("\\");
    let fileName = filePath.substring(nameIndex+1);
    wx.showLoading({title:'正在上传《'+fe+'》',mack:true})
    wx.cloud.uploadFile({
      cloudPath: 'f'+cSavePath+'\\'+fileName,
      filePath: filePath
    }).then( res => {
      wx.hideLoading()
      resolve(fileName)
    }).catch(e => {
      wx.hideLoading()
      wx.showToast({
        icon: 'none',
        title: '上传失败'+e.errMsg,
      })
    })
  })
}

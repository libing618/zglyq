import {noEmptyObject} from '../../index.js';
wx.cloud.init({
  env: 'lyqplugincloud-b64fe0',
  traceUser: true
})
const db = wx.cloud.database();

function requestCallback(err, data) {
  if (err && err.error) {
    wx.showModal({title: '上传文件', content: '请求失败：' + err.error.Message + '；状态码：' + err.statusCode, showCancel: false});
  } else if (err) {
    wx.showModal({title: '上传文件', content: '请求出错：' + err + '；状态码：' + err.statusCode, showCancel: false});
  } else { return data}
};

export function loginAndMenu(roleData) {
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success:(res)=> {
        if (res.authSetting['scope.userInfo']) {            //用户已经同意小程序使用用户信息
          wx.getStorage({
            key: 'roleData',
            success: function (res) {
              resolve(res.data)
            },
            fail: function(){
              resolve(roleData)
            }
          })
        } else { resolve(roleData) }
      },
      fail: (resFail) => { reject('用户没有授权登录') }
    })
  }).then(rData=>{
    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({ name: 'login',data:{loginState:1} }).then((rfmData) => {
        resolve(rfmData.result)           //用户如已注册则返回菜单和单位数据，否则进行注册登录
      }).catch(err=>{
        openWxLogin().then(rlgData => {
          resolve(rlgData)
        }).catch(err=> { reject(err) });
      });
    });
  }).then(reData=>{
    return new Promise((resolve, reject) => {
      wx.getUserInfo({        //检查客户信息
        withCredentials: false,
        lang: 'zh_CN',
        success: function ({ userInfo }) {
          if (userInfo) {
            let updateInfo = false,gData={};
            for (let iKey in userInfo) {
              if (userInfo[iKey] != reData.user[iKey]) {             //客户信息有变化
                updateInfo = true;
                reData.user[iKey] = userInfo[iKey];
                gData[iKey] = userInfo[iKey];
              }
            };
            if (updateInfo) {
              db.collection('_User').doc(reData.user._id).update({
                data: gData
              }).then(() => {
                resolve(reData);
              })
            } else {
              resolve(reData);
            };
          }
        }
      });
    }).catch((loginErr) => { reject('系统登录失败:' + JSON.stringify(loginErr)) });
  });
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


export function openWxLogin() {              //解密unionid并进行注册
  return new Promise((resolve, reject) => {
    wx.login({
      success: function (wxlogined) {
        if (wxlogined.code) {
          wx.getUserInfo({
            withCredentials: true,
            lang: 'zh_CN',
            success: function (wxuserinfo) {
              if (wxuserinfo.errMsg=='getUserInfo:ok') {
                wx.cloud.callFunction({                  // 调用云函数
                  name: 'login',
                  data: { code: wxlogined.code, encryptedData: wxuserinfo.encryptedData, iv: wxuserinfo.iv, loginState:0 }
                }).then(res => {
                  let roleData = {
                    user: {                          //用户的原始定义
                      updatedAt: db.serverDate(),
                      line: 9,                   //条线
                      position: 9,               //岗位
                      nickName: res.result.nickName,
                      gender: res.result.gender,
                      language: res.result.language,
                      city: res.result.city,
                      province: res.result.province,
                      country: res.result.country,
                      avatarUrl: res.result.avatarUrl,
                      uName: res.result.nickName,
                      unionid: res.result.unionId || null,
                      unit: '0',
                      mobilePhoneNumber: "0"
                    }
                  };
                  db.collection('_User').add({
                    data: roleData.user
                  }).then(_id => {
                    roleData.user._id = _id;
                    roleData.wmenu = [            //用户刚注册时的基础菜单
                      [100, 107, 108, 109, 110, 111, 114],
                      [200, 201, 202, 203, 204],
                      [308],
                      [401]
                    ];
                    roleData.uUnit = { };            //用户单位信息（若有）
                    roleData.sUnit = { };
                    resolve(roleData);
                    }).catch(err => { reject({ ec: 2, ee: err }) })     //云端注册失败
                }).catch(err => {
                  reject({ ec: 1, ee: err })     //云端解密失败
                })
              }
            }
          })
        } else { reject({ ec: 3, ee: '微信用户登录返回code失败！' }) };
      },
      fail: function (err) { reject({ ec: 4, ee: err.errMsg }); }     //微信用户登录失败
    })
  });
};

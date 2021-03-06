const { updateDoc, loginCloud } = requirePlugin('lyqPlugin');
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
};

export function tabClick(e) {                                //点击tab
  this.setData({
    pageCk: Number(e.currentTarget.id)               //点击序号切换
  });
};

export function noEmptyObject(obj){
  for (let k in obj){
    return true;
  }
  return false;
};

export function indexClick(e){                           //选择打开的索引数组本身id
  this.setData({ iClicked: e.currentTarget.id });
};

export function mClick(e) {                      //点击mClick
  let pSet = {};
  pSet['mChecked['+e.currentTarget.id+']'] = !this.data.mClicked[e.currentTarget.id];
  this.setData(pSet)
};

export function formatTime(date=new Date(),isDay=false) {
  date = new Date(date)
  let year = date.getFullYear()+''
  let month = date.getMonth() + 1
  let day = date.getDate()
  if (isDay){
    return [year, month, day].map(formatNumber).join('-')
  } else {
    let hour = date.getHours()
    let minute = date.getMinutes()
    let second = date.getSeconds();
    return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  }
};

export function loginAndMenu(roleData) {
  function synUserInfo(userData) {              //同步用户信息
    wx.getUserInfo({        //检查客户信息
      withCredentials: false,
      lang: 'zh_CN',
      success: function ({ userInfo }) {
        if (userInfo) {
          let updateInfo = false,gData={};
          for (let iKey in userInfo) {
            if (userInfo[iKey] != userData[iKey]) {             //客户信息有变化
              updateInfo = true;
              userData[iKey] = userInfo[iKey];
              gData[iKey] = userInfo[iKey];
            }
          };
          if (updateInfo) {
            updateDoc('_User',userData._id,gData).then(() => {
              return userData;
            })
          } else {
            return userData;
          };
        }
      }
    });
  };
  return new Promise((resolve, reject) => {
    wx.getSetting({
      success:(res)=> {
        if (res.authSetting['scope.userInfo']) {            //用户已经同意小程序使用用户信息
          loginCloud(1).then(reData=>{
            if (reData){           //用户如已注册则返回菜单和单位数据，否则进行注册登录
              wx.setStorage({
                key: 'roleData',
                data: reData
              });
              resolve(reData)
            } else {
              openWxLogin().then(rlgData => {
                wx.setStorage({
                  key: 'roleData',
                  data: rlgData
                });
                resolve(rlgData)
              });
            }
          });
        } else { resolve(false) }
      },
      fail: (resFail) => { reject('读取用户授权信息错误') }
    })
  }).catch((loginErr) => { reject('系统登录失败:' + JSON.stringify(loginErr)) });
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
                let { loginCloud,addDoc } = requirePlugin('lyqPlugin');   // 调用云函数
                loginCloud(0,{ code: wxlogined.code, encryptedData: wxuserinfo.encryptedData, iv: wxuserinfo.iv}).then(res => {
                  let roleData = {
                    user: {                          //用户的原始定义
                      line: 9,                   //条线
                      position: 9,               //岗位
                      nickName: res.nickName,
                      gender: res.gender,
                      appid: res.watermark.appid,
                      city: res.city,
                      province: res.province,
                      country: res.country,
                      avatarUrl: res.avatarUrl,
                      uName: res.nickName,
                      unionid: res.unionId || null,
                      unit: '0',
                      updatedAt: new Data(),
                      mobilePhoneNumber: "0"
                    }
                  };
                  addDoc('_User',roleData.user).then(({_id}) => {
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

export function shareMessage() {
  return {
    title: '侠客岛创业服务平台', // 分享标题
    desc: '扶贫济困，共享良品。', // 分享描述
    path: '/pages/manage/manage' // 分享路径
  }
};

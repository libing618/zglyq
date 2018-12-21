const db = wx.cloud.database();
const _ = db.command;
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
export function iMenu(indexArr, menuArr) {
  allMenu = require['modules.js'][indexArr];
  return menuArr.map(rNumber=> {
    return { tourl: allMenu['N' + rNumber].tourl, mIcon: allMenu[indexArr]['m' + rNumber], mName: allMenu[indexArr]['N' + rNumber].mName }
  })
}

export function hTabClick(e) {                                //点击头部tab
  this.setData({
    "ht.pageCk": Number(e.currentTarget.id)
  });
};

export function indexRecordFamily(requery,indexField,aFamilyLength) {             //按索引字段和类型整理已读数据
  return new Promise((resolve, reject) => {
    let aData = {}, indexList = new Array(aFamilyLength), aPlace = -1, iField, aFamily, fieldFamily, aIndex = {};
    indexList.fill([]);
    requery.forEach(onedata => {
      aData[onedata.id] = onedata;
      iField = onedata.get(indexField);                  //索引字段读数据数
      aFamily = onedata.get('afamily');
      fieldFamily = iField+''+aFamily;
      if (indexList[aFamily].indexOf(iField)<0) {
        indexList[aFamily].push(iField);
        aIndex[fieldFamily] = {
          uName:onedata.get('uName'),
          indexFieldId:[onedata.id]
        };                   //分类ID数组增加对应ID
      } else {
        aIndex[fieldFamily].indexFieldId.push(onedata.id);
      };
    });
    let cPage = indexList.map((tId,family)=>{
      return tId.map(fi=>{
        return { indexId: fi, uName: aIndex[fi + family].uName,iCount:aIndex[fi+family].indexFieldId.length}
      })
    })
    resolve({indexList,aData}) ;
  }).catch( error=> {reject(error)} );
};

export function noEmptyObject(obj){
  for (let k in obj){
    return true;
  }
  return false;
};

export function fetchRecord(requery,indexField,sumField) {                     //同步云端数据到本机
  return new Promise((resolve, reject) => {
    let aData = {}, aIndex = {}, indexList = [], aPlace = -1, iField, iSum = {}, mChecked = {};
    arp.forEach(onedata => {
      aData[onedata.id] = onedata;
      iField = onedata.get(indexField);                  //索引字段读数据数
      if (indexList.indexOf(iField<0)) {
        indexList.push(iField);
        aIndex[iField] = [onedata.id];                   //分类ID数组增加对应ID
        iSum[iField] = onedata.get(sumField);
      } else {
        iSum[iField] += onedata.get(sumField);
        aIndex[iField].push(onedata.id);
      };
      mChecked[onedata.id] = true;
    });
    resolve({indexList:indexList,pageData:aData,quantity:iSum,mCheck:mChecked}) ;
  }).catch( error=> {reject(error)} );
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

module.exports ={
  procedureclass: require('modules/procedureclass.js'),
  getData: require('modules/db-get-data.js')
}

module.exports = {
  getData: require('modules/db-data.js').getData,
  existence: require('modules/db-data.js').existence,
  updateDoc: require('modules/db-data.js').updateDoc,
  addDoc: require('modules/db-data.js').addDoc,
  criteriaQuery: require('modules/db-data.js').criteriaQuery,
  loginCloud: require('modules/db-data.js').loginCloud,
  queryById: require('modules/db-data.js').queryById,
  cargoCount: require('modules/dataAnalysis.js').cargoCount,

  roleData: {
    user: {                                     //用户的原始定义
      "line": 9,                   //条线
      "position": 9,               //岗位
      "unit": "0",
      "city": "Taiyuan",
      "uName": "0",
      "nickName": "游客",
      "language": "zh_CN",
      "gender": 1,
      "province": "Shanxi",
      "avatarUrl": "avatarUrl",
      "country": "CN",
      "mobilePhoneNumber": "0",
      "_id": "0"
    },
    wmenu: [
      [100,114],                         //用户未注册时的基础菜单
      [],
      [],
      []
    ],
    uUnit:{},                           //用户单位信息（若有）
    sUnit:{}                           //上级单位信息（若有）
  },

  initApp(sysinfo) {
    wx.cloud.init();
    wx.setStorage({ key: 'sysinfo', data: sysinfo });
  },
  

  iMenu(indexArr, menuArr) {
    let allMenu = require('./modules/allmenu.js')[indexArr];
    return menuArr.map(rNumber=> {
      return { tourl: allMenu['N' + rNumber].tourl, mIcon: allMenu['m' + rNumber], mName: allMenu['N' + rNumber].mName }
    })
  }
}

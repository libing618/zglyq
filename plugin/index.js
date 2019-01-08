module.exports = {
  getData: require('modules/db-data.js').getData,
  updateDoc: require('modules/db-data.js').updateDoc,
  addDoc: require('modules/db-data.js').addDoc,
  loginCloud: require('modules/db-data.js').loginCloud,
  queryById: require('modules/db-data.js').queryById,
  cargoCount: require('modules/dataAnalysis.js').cargoCount,
  initApp(){
    wx.cloud.init();
    return wx.getStorageSync('roleData') || require('./modules/globaldata');
  },

  iMenu(indexArr, menuArr) {
    let allMenu = require('./modules/allmenu.js')[indexArr];
    return menuArr.map(rNumber=> {
      return { tourl: allMenu['N' + rNumber].tourl, mIcon: allMenu['m' + rNumber], mName: allMenu['N' + rNumber].mName }
    })
  }
}

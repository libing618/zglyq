module.exports = {
  getData: require('modules/db-get-data.js').getData,
  loginCloud: require('modules/db-get-data.js').loginCloud,
  openWxLogin: require('modules/initForm.js').openWxLogin,
  queryById: require('modules/db-get-data.js').queryById,
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

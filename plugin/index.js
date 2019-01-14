module.exports = {
  getData: require('modules/db-data.js').getData,
  existence: require('modules/db-data.js').existence,
  updateDoc: require('modules/db-data.js').updateDoc,
  addDoc: require('modules/db-data.js').addDoc,
  criteriaQuery: require('modules/db-data.js').criteriaQuery,
  loginCloud: require('modules/db-data.js').loginCloud,
  queryById: require('modules/db-data.js').queryById,
  cargoCount: require('modules/dataAnalysis.js').cargoCount,
  initApp(){
    wx.cloud.init();
    return require('modules/globaldata.js')
  },

  iMenu(indexArr, menuArr) {
    let allMenu = require('./modules/allmenu.js')[indexArr];
    return menuArr.map(rNumber=> {
      return { tourl: allMenu['N' + rNumber].tourl, mIcon: allMenu['m' + rNumber], mName: allMenu['N' + rNumber].mName }
    })
  }
}

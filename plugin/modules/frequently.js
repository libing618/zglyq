module.exports = {
  formatTime(date = new Date(), isDay = false) {
    date = new Date(date)
    let year = date.getFullYear() + ''
    let month = date.getMonth() + 1
    let day = date.getDate()
    function formatNumber(n) {
      n = n.toString()
      return n[1] ? n : '0' + n
    };
    if (isDay) {
      return [year, month, day].map(formatNumber).join('-')
    } else {
      let hour = date.getHours()
      let minute = date.getMinutes()
      let second = date.getSeconds();
      return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
    }
  },

  hTabClick(e) {                                //点击头部tab
    this.setData({
      "ht.pageCk": Number(e.currentTarget.id)
    });
  },

  indexClick(e){                           //选择打开的索引数组本身id
    this.setData({ iClicked: e.currentTarget.id });
  },

  mClick(e) {                      //点击mClick
    let pSet = {};
    pSet['mChecked['+e.currentTarget.id+']'] = !this.data.mClicked[e.currentTarget.id];
    this.setData(pSet)
  },

  indexRecordFamily(requery,indexField,aFamilyLength) {             //按索引字段和类型整理已读数据
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
  },

  noEmptyObject(obj){
    for (let k in obj){
      return true;
    }
    return false;
  },

  shareMessage() {
    return {
      title: '侠客岛创业服务平台', // 分享标题
      desc: '扶贫济困，共享良品。', // 分享描述
      path: '/pages/manage/manage' // 分享路径
    }
  },

  fetchRecord(requery,indexField,sumField) {             //同步云端数据到本机
    return new Promise((resolve, reject) => {
      let aData = {}, aIndex = {}, indexList = [], aPlace = -1, iField, iSum = {}, mChecked = {};
      arp.forEach(onedata => {
        aData[onedata.id] = onedata;
        iField = onedata[indexField];                  //索引字段读数据数
        if (indexList.indexOf(iField<0)) {
          indexList.push(iField);
          aIndex[iField] = [onedata._id];                   //分类ID数组增加对应ID
          iSum[iField] = onedata[sumField];
        } else {
          iSum[iField] += onedata[sumField];
          aIndex[iField].push(onedata._id);
        };
        mChecked[onedata._id] = true;
      });
      resolve({indexList:indexList,pageData:aData,quantity:iSum,mCheck:mChecked}) ;
    }).catch( error=> {reject(error)} );
  }
}

const db = wx.cloud.database();
const _ = db.command;
const sysinfo = wx.getStorageSync('sysinfo');
const roleData = wx.getStorageSync('roleData');

function _objToStrArr(dn,obj) {
  let arr = [dn];
  for (let k in obj) {
    arr.push(k + '=' + JSON.stringify(obj[k]))
  }
  return arr
}

function _getError(error) {
  wx.getNetworkType({
    success: function (res) {
      if (res.networkType == 'none') {
        wx.showToast({ title: '请检查网络！' });
      } else {
        wx.showToast({ title: '数据处理错误：'+JSON.stringify(error) ,icon:'none'});
      }
    }
  });
};

export function afamilySwitchSave(pno,modalId,arrNext) {                //切换afamily数据
  return new Promise((resolve, reject) => {
    db.collection(pno).doc(modalId).set('afamily',arrNext).save().then(({data}) => { resolve(data) })
  }).catch(err=>{_getError(err)});
};

export class geoQueryUnit {
  constructor (selTypes,province_code){
    this.qUnit = db.collection('_Role').where(
      _.or(
        selTypes.map(stype=>{
          return { indType: db.RegExp({ regexp: stype }) }
        })
      ),
      { 'address_code': _.lt((province_code+1)*10000).and(_.gte(province_code*10000)) }
    );
    this.unitCount = 0;
  };
  nextGroup(){
    return new Promise((resolve, reject) => {
      if (this.unitCount == -1){
        resolve( [] )
      } else {
        this.qUnit.skip(this.nIndex.length).limit(20).get().then(({data}) => {
          if (data.length>0){
            this.unitCount += data.length;
            resolve(data)
          } else {
            this.unitCount = -1
            resolve( [] )
          }
        })
      }
    }).catch(err=>{_getError(err)})
  }
};

export class cargoStock {
  constructor (cargo_id,packages){
    this.stockCargo = db.collection('cargoStock').doc(cargo_id);
    this.packages = packages;
  };
  getStock(){
    return new Promise((resolve, reject) => {
      this.stockCargo.get().then(({data}) => {
        if (data){
          resolve(
            {scale: ((data.payment + data.delivering + data.delivered) / this.packages).toFixed(0),
            csupply: (data.canSupply / this.packages - 0.5).toFixed(0)}
          )
        } else {
          resolve( {scale:0,csupply:0} )
        }
      })
    }).catch(err=>{_getError(err)})
  }
};

export class getData {               //wxcloud批量查询
  constructor (dataName,afamily=0,uId=roleData.user.unit,requirement={},orderArr=[['updatedAt','desc']]) {
    this.pNo = dataName;
    if (['articles','banner','qa'].includes(dataName)) {               //是否全部单位数组
      this.unitFamily = 'allUnit';
    } else {
      this.unitFamily = uId;
      requirement.unitId = _.eq(uId)
    };                //除文章类数据外只能查指定单位的数据
    if (require('procedureclass')[dataName].afamily) {       //是否有分类数组
      requirement.afamily = _.eq(afamily);
      this.unitFamily += afamily;
    };
    let aIndex = wx.getStorageSync('aIndex')[dataName];
    let orderStrArr = orderArr.map(aOrder=>{ return aOrder[0]+'^'+aOrder[1] });  //排序条件生成字符串数组
    let requirStrArr = _objToStrArr(dataName,requirement).concat(orderStrArr);  //查询条件生成字符串数组合并排序条件字符串数组
    let requirString = requirStrArr.sort().join('&');
    let crypto = require('crypto');
    this.filterId = crypto.enc.Base64.stringify(crypto.HmacSHA1(requirString, this.unitFamily));  //生成条件签名
    this.dQuery = db.collection(this.pNo).where(requirement)
    orderArr.forEach(ind=> {this.dQuery=this.dQuery.orderBy(ind[0],ind[1])} );
    this.isEnd = false;
    this.nData = {};
    this.nIndex = []
    if (aIndex.hasOwnProperty(this.filterId)) {       //添加以条件签名为Key的JSON初值
      wx.getStorage({
        key: this.pNo,
        success: function (res) {
          if (res.data){
            this.nIndex = aIndex[this.filterId].filter(indkey=>{
              if (indkey in res.data){
                this.nData = res.data[indkey];
                return true
              }
            });
          };
        }
      });
    };
  };
  _mapResData(dataIndex,rData){           //处理查询到的数组
    rData.forEach(aProc =>{
      if (dataIndex.includes(aProc._id)) {this.nData[aProc._id] = aProc};
    });
    return
  };
  addViewData(addItem,mPage) {
    let spData = {}
    spData[mPage] = this.nIndex;
    addItem.forEach(mId=>{ spData['pageData.'+mId]=this.nData[mId] });
    return spData;
  };
  downData(){    //向下查询
    return new Promise((resolve, reject) => {
      if (this.isEnd){
        wx.showToast({title:'到底了',icon:'warn',duration:1000});
        resolve(false);
      } else {
        this.dQuery.skip(this.nIndex.length).limit(20).get().then(({data}) => {
          if (data.length>0){
            let addItemId = data.map(newData=>{return newData._id});
            this.nIndex = this.nIndex.filter(indkey=>{ return addItemId.indexOf(indkey)>=0 })
            this.nIndex = this.nIndex.concat(addItemId)
            if (this.bufferData.length>0){            //原来有缓存数据
              let buffTopAt=this.nData[this.bufferData[0]].updatedAt;
              let aPlace = addItemId.indexOf(this.bufferData[0]);
              if (aPlace>-1){            //从顶部查询的数据与原来的缓存数据相交
                if (this.nData[addItemId[aPlace]].updatedAt==buffTopAt) {
                  addItemId = addItemId.slice(0,aPlace)
                  this.bufferData = this.bufferData.filter(indkey=>{ return this.nIndex.indexOf(indkey)>=0 })
                  this.nIndex = this.nIndex.concat(this.bufferData);
                };
                this.bufferData = [];
              };
            }
            this._mapResData(addItemId,data);
            resolve(addItemId);
          } else {
            this.isEnd = true;
            resolve(false);
          }
        })
      }
    }).catch(err=>{_getError(err)})
  };
  upData(){    //从头查询
    return new Promise((resolve, reject) => {
      this.dQuery.limit(20).get().then(({data}) => {
        if (data.length>0){
          let addItemId = data.map(newData=>{return newData._id});
          if (this.nIndex.length>0){            //原来有缓存数据
            let buffTopAt=this.nData[this.nIndex[0]].updatedAt;
            let aPlace = addItemId.indexOf(this.nIndex[0]);
            if (aPlace>-1){            //从顶部查询的数据与原来的缓存数据相交
              if (this.nData[addItemId[aPlace]].updatedAt==buffTopAt) {
                addItemId = addItemId.slice(0,aPlace);
                this.nIndex = this.nIndex.filter(indkey=>{ return addItemId.indexOf(indkey)>=0 })
                this.nIndex = addItemId.concat(this.nIndex);
                bData.forEach(bini=>{
                  if(addItemId.indexOf(bini)<0) {
                    this.nIndex.push(bini)
                  }
                })
              } else {           //相交的缓存数据时间有变化则不再考虑缓存数据
                this.nIndex = addItemId
              }
            } else {
              this.bufferData = this.nIndex;
              this.nIndex = addItemId;
            }
          }
          this._mapResData(addItemId,data);
          resolve(addItemId);
        } else {
          resolve(false);
        }
      })
    }).catch(err=>{_getError(err)})
  };
  allData(){    //查询全部
    return new Promise((resolve, reject) => {
      this.dQuery.limit(20).get().then(res => {
        let aProcedure = res.data;
        if (aProcedure.length>19){
          let reaAll = Promise.resolve(dQuery.skip(aProcedure.length).get()).then(notEnd => {
            aProcedure = aProcedure.concat(notEnd.data)
            if (notEnd.data.length>19) {
              return readAll();
            } else {
              this.nIndex = aProcedure.map(newData=>{return newData._id});
              this._mapResData(this.nIndex,aProcedure);
              this.isEnd = true;
              resolve(this.nIndex);
            }
          });
        }
      });
    }).catch(err=>{_getError(err)})
  }
}

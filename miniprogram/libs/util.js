const db = wx.cloud.database();
let app=getApp()
function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
};

export function hTabClick(e) {                                //点击头部tab
  this.setData({
    "ht.pageCk": Number(e.currentTarget.id)
  });
};

export function tabClick(e) {                                //点击tab
  app.aIndex['pCk'+this.data.pNo] = Number(e.currentTarget.id);
  this.setData({
    pageCk: app.aIndex['pCk'+this.data.pNo]               //点击序号切换
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

export function shareMessage() {
  return {
    title: '侠客岛创业服务平台', // 分享标题
    desc: '扶贫济困，共享良品。', // 分享描述
    path: '/pages/manage/manage' // 分享路径
  }
};

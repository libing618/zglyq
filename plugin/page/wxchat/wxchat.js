//系统对话和聊天室模块
import {checkRols} from '../../modules/initForm';
import { fileUpload } from '../../modules/wxcloudcf';
const db = wx.cloud.database();
const conversationRole = {
  "推广通知":{participant:9,chairman:6},
  "工作沟通":{participant:8,chairman:5},
  "直播课堂":{participant:9,chairman:7},
  "客户服务":{participant:9,chairman:6}
};
const sysinfo = wx.getStorageSync('sysinfo');
const roleData = wx.getStorageSync('roleData');
Page({
  data:{
    sysheight:sysinfo.windowHeight-60,
    syswidth:sysinfo.windowWidth-10,
    statusBar: sysinfo.statusBarHeight,
    user: roleData.user,
    enMultimedia: true,
    chairman: false,
    sPages: [],
    vData: {},
    message: [],
    idClicked: '0',
    cId:''
  },

  onLoad:function(options){
    var that = this;
    let cPageSet = {};
    let nowPages = getCurrentPages();
    nowOpenChat = nowPages[nowPages.length-1];
    cPageSet.navBarTitle = options.ctype;
    if (options.ctype=='客户服务'){    //对话形式
      cPageSet.announcement = false;    //无通告（直播）窗口
      cPageSet.cId='5aedc6f9ee920a0046b050b4';
    } else {
      if (checkRols(conversationRole[options.ctype].participant,roleData.user)){
        cPageSet.announcement = true;    //有通告（直播）窗口
        cPageSet.chairman = conversationRole[options.ctype].participant,roleData.user;
      }
    };
  },

  getM(pNo,artId){
    let aData = wx.getStorageSync(pNo)[artId] || {};
    let cPageSet = {messages: conMsg[cPageSet.cId]};
    if (options.pNo && options.artId){
      let iMsg = {mtype: -1};
      return new Promise((resolve, reject) => {
        if (aData){
          resolve(true)
        } else {
          db.collection(pNo).doc(artId).get().then(({result})=>{
            aData = result;
            resolve(true)
          }).catch(reject(false))
        }
      }).then(()=>{
        let fData = require('../../modules/procedureclass')[pNo]
        iMsg.mtext = fData.pName+':'+aData.uName;
        iMsg.mcontent = aData;
        iMsg.mcontent.pNo = pNo;
        sendM(iMsg,cPageSet.cId).then(()=>{
          cPageSet.messages = conMsg[cPageSet.cId];
          that.setData(cPageSet);
        })
      })
    } else {
      that.setData(cPageSet);
    }
  },

  fMultimedia(){
    this.setData({enMultimedia: !this.data.enMultimedia});
  },

  iMultimedia(e){
    this.setData({
      mtype: '-'+e.currentTarget.id,
      wcontent: {}
    })
  },

  sendMsg({ currentTarget:{id,dataset},detail:{value} }) {
    let that = this;
    return new Promise( (resolve, reject) => {
      if (Number(that.data.mtype)<p0){
        fileUpload('wechat', value.adc0.filepath,value.adc0.e).then((cres)=>{
          resolve(...cres,value.adc0.e);
        }).catch(()=>{ reject('媒体文件保存错误！') });
      } else {
        resolve(value.wcontent);
      };
    }).then( (content) =>{
      value.wcontent = content;
      sendM(value,that.data.cId).then( (rsm)=>{
        if (rsm){
          that.setData({
            vData: {mtype:0,wcontent:{}},
            messages: conMsg[that.data.cId]
          })
        }
      });
    });
  }
})

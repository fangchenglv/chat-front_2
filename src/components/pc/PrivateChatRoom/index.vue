<template>
  <el-container lang="scss">
    <el-header style="height:auto">
      <p style="font-size:0.7rem;margin:0 0 auto;">{{this.$route.params.name}}</p>
    </el-header>

    <el-main style="margin:0 0.1rem 1.2rem 0.1rem;width:98%;padding-top:0.1rem">
      <div v-if="File !== null" style="position:sticky; top:0">
        <strong style="padding-right:0.2rem">{{File.name}}</strong>
        <button @click="stop">暂停</button>
        <button @click="continueFile">继续</button>
        <p v-if="this.fileUpload.enableRead == false">已暂停</p>
        <p v-if="this.fileUpload.enableRead == true">传输中</p>
      </div>
      <div v-for="(item, ind) in this.messageList" :key="ind">
          <FriendItem v-if="item.fromUser.id == userId" :messageid="item.id" :img="item.fromUser.avatar" me="true" :msg="item.message" :name="item.fromUser.nickName" :filea="item.File" :time="item.time"></FriendItem>
          <MyItem v-else :img="item.fromUser.avatar" :messageid="item.id" :msg="item.message" :name="item.fromUser.nickName" :filea="item.File":time="item.time" ></MyItem>

      </div>

      
    </el-main>
    
    <el-footer>
      <el-dropdown trigger="click" style="margin-right:0.3rem">
        <el-button type="primary" plain>
          上传<i class="el-icon-arrow-up el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown" >

          <el-dropdown-item style="display:relative">
            <input type="file" name="file" id="file" accept=".xls,.doc,.txt,.pdf,.gif,.jpeg,.jpg,.png" class="inputfile" @change="handleFile($event)" />
            <label for="file">上传文件</label>
          </el-dropdown-item>

          <el-dropdown-item style="display:relative">
            <input type="file" name="image" id="image" accept="image/gif,image/jpeg,image/jpg,image/png" class="inputfile" @change="handleFile($event)" />
            <label for="file">上传图片</label>
          </el-dropdown-item>

        </el-dropdown-menu>
      </el-dropdown>
      <el-input 
        v-model="message"
        style="width:60%"></el-input>
      <el-button 
        type="primary" 
        plain 
        @click="sendMsg" 
      >发送</el-button>

    </el-footer>

  </el-container>
</template>

<script>
import {sendMessage, getHistoryReadList, getUnreadMessageList} from "@/api/friendOperation"
import FriendItem from "./FriendItem"
import MyItem from './MyItem';
import { type } from 'os';
import Data from 'vue';
import { mapState, mapGetters } from 'vuex'
import CryptoJS from 'crypto-js'

export default {
  components: {
      MyItem,
      FriendItem
  },
  data() {
    return { 
      message: "",
      imageFile: "",
      File: null,
      fileUrl: "",
      ff:0,
      total:0,
      reader:null,
      fileUpload:{
        cuLoaded: 0,
        step: 65536,
        enableRead: true
      },
      startTime: 0,
      readerObj: null,
      websock: null,
      historyMessageList:[],    //历史消息列表
      unreadList:[],    //未读消息列表
      unreadLeaveFriend:this.$store.getters.leaveMessage,
      friendId:""+this.$route.params.friendId,
      userId:this.$store.getters.userId,
      messageList:[],
      myNickName:this.$store.getters.userNickname,
      friendNickName:this.$route.params.name,
      myRSAKey:"",
    };
  },
  computed:{
    currendStartChatList:{
      get(){
        if (this.$websocket.getters.privateMessage(this.friendId) === undefined || this.$websocket.getters.privateMessage(this.friendId) === null) {
          return [];
        }
        return this.$websocket.getters.privateMessage(this.friendId)
      },
      set(val){
      }
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy(){
    this.$websocket.state.privateMessage[this.friendId] = this.currendStartChatList;
    this.$websocket.dispatch("StopChatId");
  },
  methods: {
    init(){
      //要把未读数清零
      this.$websocket.state.privateUnreadNumber[this.friendId] = null;
      this.$websocket.dispatch("StartChatId", [this.friendId, "private"]);
      this.getUnreadList(this.$store.getters.userId, this.$route.params.friendId);
      this.getKey();
    },
    //显示结果进度
    showProcess(){
        var percent = (this.fileUpload.cuLoaded / this.total) * 100;
        console.log("####文件传输百分比", percent)
        // document.getElementById('Status').innerText = percent;
    },
    getKey() {
        var jschars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
        for(var i = 0; i < 256 ; i ++) {
            var id = Math.ceil(Math.random()*13);
            this.myRSAKey += jschars[id];
        }
        console.log("我的密钥是这个",this.myRSAKey)
        return this.myRSAKey;
    },

    // AES加密
    encrypt(word,key){
        let encJson = CryptoJS.AES.encrypt(JSON.stringify(word),key).toString();
         //对加密数据进行base64处理, 原理：就是先将字符串转换为utf8字符数组，再转换为base64数据
        let encData = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson));
        console.log("加密前",word,"加密后", encData)
        return encData;
    },
    // AES解密
    decrypt(word,key){
        let decData = CryptoJS.enc.Base64.parse(word).toString(CryptoJS.enc.Utf8);
          //解密数据
        let decJson = CryptoJS.AES.decrypt(decData, key).toString(CryptoJS.enc.Utf8);
        let userInfo = JSON.parse(decJson);
        console.log("解密前",word,"解密后", userInfo)
        return userInfo;
    },

    //绑定reader，onmessage里面用
    bindReader() {
      this.startTime = new Date();
      this.fileUpload.enableRead = true;
      this.reader = new FileReader();
      //读取一段成功
      let me = this
      this.reader.onload = function (e) {
        console.info('读取总数：' + e.loaded);
        if (me.fileUpload.enableRead == false)
          return false;
        //根据当前缓冲区来控制客户端读取速度
        if (me.$websocket.dispatch("GetBufferedAmount") > me.fileUpload.step * 10) {
          setTimeout(function () {
            //继续读取
            console.log('--------------》进入等待');
            me.loadSuccess(e.loaded);
          }, 3);
        } else {
          //继续读取
          me.loadSuccess(e.loaded);
        }
      }
      //开始读取
      this.readBlob();
    },
    //读取文件成功处理
    loadSuccess(loaded) {
        //将分段数据上传到服务器
        var blob = this.reader.result;
        //使用WebSocket 服务器发送数据
        this.$websocket.dispatch("SendWebsocketFileMessage", blob);
        //如果没有读完，继续
        this.fileUpload.cuLoaded += loaded;
    },
    //指定开始位置，分块读取文件
    readBlob() {
        //指定开始位置和结束位置读取文件
        console.log("readBlob的file为啥为空", this.File)
        var blob = this.File.slice(this.fileUpload.cuLoaded, this.fileUpload.cuLoaded + this.fileUpload.step);
        this.reader.readAsArrayBuffer(blob);
    },
    websockOnMessage(){
      let param = null;
      this.$websocket.state.websock.onmessage = e =>{

        console.log("###########又得开始看返回，生气", e)

        let dd=e.data;
        let data = e.data;
        const re = /^[0-9]+.?[0-9]*/;
        const page = /^.*\..*$/;
        if (data.status === -1) {

          return
        }
        // 数字的话就是文件部分了


       console.log("喵dd1.5");
        if (re.test(data)) {
        console.log("喵dd2.0");
          this.fileUpload.cuLoaded = parseInt(data);
          console.log('当前已上传：' + this.fileUpload.cuLoaded);
          this.showProcess();
          console.log('开始上传数据........',);
          this.bindReader();
        } else if(page.test(data) && (this.ff==1)){
        console.log("喵dd3.0");
          // this.fileUrl = data;
          this.sendFile(data)
          this.ff=0;
        }
        else if(data=='canceled'){
        console.log("喵dd4.0");
          console.log('取消上传数据........');
          this.fileUpload.cuLoaded = 0;
          this.showProcess();
          this.fileUpload.enableRead = false;
          this.reader.abort();
        } else if(data=='ok'){
        console.log("喵dd5.0");
          if (this.fileUpload.cuLoaded < this.total) {
            this.readBlob();
          } else {
            this.$websocket.dispatch("SendWebsocketFileMessage" ,'act:complete');
            console.log('总共上传：' + this.fileUpload.cuLoaded + ',总共用时：' + (new Date().getTime() - this.startTime.getTime()) / 1000);
          }
          this.showProcess();

        }


        data = JSON.parse(e.data);
          if(data.status === 200){
            if (!data.data.toGroupId && data.data.fromUserId == this.friendId ){
              let msgId = -1;
              if(data.data.type === "SINGLE_SENDING"){
                let dat = data.data;
                msgId = 0;
                param = {
                  "fromUser":{"id":this.$route.params.friendId,
                              "nickName": this.$route.params.name,
                              },
                  "toUser":{"id":this.$store.getters.userId, 
                            "nickName":this.$store.getters.userNickname, 
                            },
                  "message":this.decrypt(""+dat.content,dat.digitalEnvelope),
                  "id": msgId,
                  "time":dat.time,
                };
              }
              else if (data.data.type === "SINGLE_SENDING_IMG"){

                let dat = data.data;
                msgId = 1;
                param = {
                  "fromUser":{"id":this.$route.params.friendId,
                              "nickName": this.$route.params.name,
                              },
                  "toUser":{"id":this.$store.getters.userId, 
                            "nickName":this.$store.getters.userNickname, 
                            },
                  "message":dat.content,
                  "id": msgId,
                  "time":dat.time,
                };
              } else {
              console.log("汪1");
                let dat = data.data;
                msgId = 2;
                param = {
                  "fromUser":{"id":this.$route.params.friendId,
                                "nickName": this.$route.params.name,
                                },
                  "toUser":{"id":this.$store.getters.userId,
                            "nickName":this.$store.getters.userNickname,
                            },
                  "message":JSON.parse(dat.content),
                  "id": msgId,
                  "time":dat.time,
                  };
                  console.log("这里能下载吗", "https://65.49.204.236/group1/"+JSON.parse(dat.content).fileUrl);
                  // let routeData ="https://65.49.204.236/group1/"+JSON.parse(dat.content).fileUrl;
                  // window.open(routeData, '_blank');
              }
              this.File=null;
              //添加到信息列表，以便展示信息
              if (! this.messageList){
                this.messageList = [param];
              }
              else{
                this.messageList.push( param );
              }
              this.currendStartChatList.push(data.data)
            } else{
              let re = /SINGLE/;
              if (re.test(data.data.type) === true) {
                this.$message("新的好友信息，请注意查看");
                if(this.$websocket.state.privateMessage.find( (val, ind) => ind == data.data.fromUserId ) != null || this.$websocket.state.privateMessage.find( (val, ind) => ind == data.data.fromUserId ) != undefined){
                  this.$websocket.state.privateMessage[data.data.fromUserId].push(data.data);
                  this.$websocket.state.privateUnreadNumber[data.data.fromUserId] = (+this.$websocket.state.privateUnreadNumber[data.data.fromUserId]) + 1;
                } else{
                  this.$websocket.state.privateMessage[data.data.fromUserId] = [data.data];
                  this.$websocket.state.privateUnreadNumber[data.data.fromUserId] = +1;
                }            
              } else {
                this.$message("新的群消息，请注意查收")
                if(this.$websocket.state.groupMessage.find((val, ind) => ind == data.data.toGroupId ) != null || this.$websocket.state.groupMessage.find((val, ind) => ind == data.data.toGroupId ) != undefined){
                  this.$websocket.state.groupMessage[data.data.toGroupId].push(data.data);
                  this.$websocket.state.groupUnreadNumber[data.data.toGroupId] = this.$websocket.state.groupUnreadNumber[data.data.toGroupId] + 1;
                } else{
                  this.$websocket.state.groupMessage[data.data.toGroupId] = [data.data];
                  this.$websocket.state.groupUnreadNumber[data.data.toGroupId] = +1;
                }
              }
            }
          }
      }
    },

    ParparePrivateChatMessage(){
      //初始化数据吧
      if (!this.currendStartChatList) {
        return ;
      }
      let param = null, msgId = -1;
      this.currendStartChatList.forEach(data => {
        if(data.type === "SINGLE_SENDING"){
        console.log("这是个啥",data)
          msgId = 0;
          if (data.fromUserId === this.friendId) {
            param = {
              "fromUser":{"id":this.$route.params.friendId,
                          "nickName": this.$route.params.name,

                          }, 
              "toUser":{"id":this.$store.getters.userId, 
                        "nickName":this.$store.getters.userNickname, 

                        },
              "message":this.decrypt(data.content,data.digitalEnvelope),
              "id": msgId,
              "time":data.time,
            };

          } else {
          console.log("这里是被解密之前的数据，为什么不行呢",data.content)
            param = {
              "fromUser":{"id":this.$store.getters.userId, 
                          "nickName":this.$store.getters.userNickname, 

                          },
              "toUser":{"id":this.$route.params.friendId,
                        "nickName": this.$route.params.name,

                        },

              //"message":data.content,
              "message":this.decrypt(data.content,data.digitalEnvelope),
              "id": msgId,
              "time":data.time,
            };

          }
        } else if (data.type === "SINGLE_SENDING_IMG"){
          msgId = 1;
          if (data.fromUserId === this.friendId) {
            param = {
              "fromUser":{"id":this.$route.params.friendId,
                          "nickName": this.$route.params.name,

                          }, 
              "toUser":{"id":this.$store.getters.userId, 
                        "nickName":this.$store.getters.userNickname, 

                        }, 
              "message":data.content,
              "id": msgId,
              "time":data.time,
            };
          }
          else {
            param = {
              "fromUser":{"id":this.$store.getters.userId, 
                          "nickName":this.$store.getters.userNickname, 

                          },
              "toUser":{"id":this.$route.params.friendId,
                        "nickName": this.$route.params.name,

                        }, 
              "message":data.content,
              "id": msgId,
              "time":data.time,
            };
          }
        } else {

                  msgId = 2;
                  if (data.fromUserId === this.friendId) {
                    param = {
                      "fromUser":{"id":this.$route.params.friendId,
                                  "nickName": this.$route.params.name,

                                  },
                      "toUser":{"id":this.$store.getters.userId,
                                "nickName":this.$store.getters.userNickname,

                                },
                      "message":JSON.parse(data.content),
                      "id": msgId,
                      "time":data.time,
                    };
                  console.log("嘿1",JSON.parse(data.content));
                  }
                  else {
                    param = {
                      "fromUser":{"id":this.$store.getters.userId,
                                  "nickName":this.$store.getters.userNickname,

                                  },
                      "toUser":{"id":this.$route.params.friendId,
                                "nickName": this.$route.params.name,

                                },
                      "message":JSON.parse(data.content),
                      "id": msgId,
                      "time":data.time,
                    };
                    console.log("嘿2",JSON.parse(data.content));
                  }


        }

        this.messageList.push(param);
      })
    },
    handleFile(event){
      this.ff=1;
      let data = event.target.files[0];

      let toId = this.$route.params.friendId;
      if((/.jpg|.jpeg|.png|.img/ig.test(data.name))&&data.size < 65530){
        //处理图片
        let me = this;
        //方式二：filereader
        let reader = new FileReader();
        reader.onload = function(e){
          me.imageFile = e.target.result;
          me.sendMsg();
        } 
        reader.readAsDataURL(data);
        //唉到底选哪个啊

      } else if(!data) {
        //没数据，退出
        return;
      } else{
        // console.log("data", data)
        this.File = data
        this.total = data.size;
        this.sendMsg();
      }
    },


    sendMsg(){
      let data = null;
      let param = null;
      if (this.message.trim() === "" && this.imageFile.trim() === ""&& this.File === null){
        this.$message.error("输入信息不能为空");
        return
      }
          var date=new Date();
      	  //年
          var year=date.getFullYear();
          //月
          var month=date.getMonth()+1;
          //日
          var day=date.getDate();
          //时
          var hh=date.getHours();
          //分
          var mm=date.getMinutes();
          //秒
          var ss=date.getSeconds();
          var rq=year+"-"+month+"-"+day+" "+hh+":"+mm+":"+ss;
      if(this.imageFile !== ""){
        data = {                    
          "fromUserId" : ""+this.userId,
          "toUserId" : ""+this.friendId,
          "content" : ""+this.imageFile,
          "type" : "SINGLE_SENDING_IMG",
          "time":""+rq,
          "digitalEnvelope":""+this.myRSAKey,
        };
        param = {
          "fromUser":{"id":this.$store.getters.userId,
                      "nickName":this.$store.getters.userNickname,
                      },
          "toUser":{"id":this.$route.params.friendId, 
                    "nickName":this.$route.params.name, 
                    },
          "message":this.imageFile,
          "time":rq,
          "id": 1

        };
        this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.friendId])
        .then(res => {
          this.currendStartChatList.push(data);
          this.messageList.push(param);
        });
        console.log("喵1");
      } else if (this.message !== ""){
      console.log("这里是发送数据前，要进行加密");

        data = {
          "fromUserId" : ""+this.userId,
          "toUserId" : ""+this.friendId,
          "content" : ""+this.encrypt(this.message,this.myRSAKey),
          "type" : "SINGLE_SENDING",
          "time":""+rq,
          "digitalEnvelope":""+this.myRSAKey,
        };
        console.log("这里是加密之后要传输的数据，为什么不行呢+this.encrypt(this.message,this.myRSAKey)",""+this.encrypt(this.message,this.myRSAKey));
        param = {
          "fromUser":{"id":this.$store.getters.userId,
                      "nickName":this.$store.getters.userNickname,
                      },
          "toUser":{"id":this.$route.params.friendId, 
                    "nickName":this.$route.params.name, 
                    },
          "message":this.message,
          "time":rq,
          "id": 0
        };
        this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.friendId])
        .then(res => {
          this.currendStartChatList.push(data);
          this.messageList.push(param);
        });
        console.log("喵2");
      } else {
        this.$websocket.dispatch("SendWebsocketFileName", this.File.name)
        console.log("喵3",this.File.name);
      }

      this.message = "";
      this.imageFile = "";
      // this.File = null;
      this.websockOnMessage();
    },
    sendFile(fileUrl){
          var date=new Date();
      	  //年
          var year=date.getFullYear();
          //月
          var month=date.getMonth()+1;
          //日
          var day=date.getDate();
          //时
          var hh=date.getHours();
          //分
          var mm=date.getMinutes();
          //秒
          var ss=date.getSeconds();
          var rq=year+"-"+month+"-"+day+" "+hh+":"+mm+":"+ss;
      //文件部分
      let data = {
        "fromUserId" : ""+this.userId,
        "toUserId" : ""+this.friendId,
        "content" : JSON.stringify({
                      "fileName": this.File.name,
                      "fileSize": this.File.size,
                      "fileUrl": fileUrl
                    }),
        "type" : "FILE_MSG_SINGLE_SENDING",
        "time":""+rq,
        "digitalEnvelope":""+this.myRSAKey,
      };
      let param = {
        "fromUser":{"id":this.$store.getters.userId,
                    "nickName":this.$store.getters.userNickname,
                    },
        "toUser":{"id":this.$route.params.friendId,
                  "nickName":this.$route.params.name,
                  },
        "message":{
                    "fileName": this.File.name,
                    "fileSize": this.File.size,
                    "fileUrl": fileUrl
                  },
        "time":rq,
        "id": 2
      };
      this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.friendId]);
      this.currendStartChatList.push(data);
      this.messageList.push(param);
      this.File = null;
      this.fileUpload.cuLoaded = 0;
      this.fileUpload.enableRead = true;
    },

    //中止
    stop() {
      //中止读取操作
      console.info('中止，cuLoaded：' + this.fileUpload.cuLoaded);
      this.fileUpload.enableRead = false;
      this.reader.abort();
    },
    //继续
    continueFile() {
      console.info('继续，cuLoaded：' + this.fileUpload.cuLoaded);
      this.fileUpload.enableRead = true;
      this.readBlob();
    },
    getUnreadList(fromId, toId){
    this.ParparePrivateChatMessage()
      getUnreadMessageList(fromId, toId).then(response =>{
        this.unreadList = response.data.data;
        if (this.unreadLeaveFriend.length > 0) {
          for (let i = 0; i < this.unreadLeaveFriend.length; i++) {
            if (this.unreadLeaveFriend[i].fromUser !== null && this.unreadLeaveFriend[i].fromUser.id == this.friendId) {
              this.unreadLeaveFriend.splice(i, 1);
              this.$store.state.leaveMessage = this.unreadLeaveFriend;
              break
            }
          }
        }
        if(this.unreadList){
          this.unreadList.forEach((data) =>{
            let t = {};
            if (data.type == "0") {
              t.fromUser = data.fromUser;
              t.message = data.message;
              t.id = 0;
              t.time=data.time;
              console.log("消息未读",t)
            }
            //要是未读信息是图片咋整
            else if (data.type == "1") {
              t.fromUser = data.fromUser;
              t.message = data.message;
              t.id = 1;
              t.time=data.time;
              console.log("图片未读",t)
            }
            //要是未读消息的文件
            else if(data.type == "2") {
              t.fromUser = data.fromUser;
              t.message = JSON.parse(data.message);
              t.id = 2;
              t.time=data.time;
              console.log("文件未读",data.message)
            }

            if(!this.messageList){
              this.messageList = [t];
              console.log("咋不读")
            }else{
              this.messageList.push(t);
            }
          })
        }

      }).catch()
    },
  },
};
</script>
<style lang="scss" scoped>
.el-container{
  position: relative;
  background-color: #fff;
}
.el-footer{
  background-color: #ABD0F7;
  position:absolute;
  left:0rem;
  bottom:0rem;
  width: 100%;
  padding: 0.02rem 0;
}
.inputfile {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}
.inputfile + label {
  cursor: pointer; /* 小手光标*/
}
</style>

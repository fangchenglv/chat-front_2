<template>
  <div class="chatPage" >
    <!-- 聊天顶部 -->
    <van-nav-bar
      :title= friendName
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />

    <div v-if="File !== null" style="position:sticky; top:0">
      <strong style="padding-right:0.2rem">{{File.name}}</strong>
      <button @click="stop">暂停</button>
      <button @click="continueFile">继续</button>
    </div>

    <!-- 聊天内容主体 -->
    <div id="body">
      <div v-for="(item, ind) in this.messageList" :key="ind">
        <FriendItem v-if="item.fromUser.id == userId" :messageid="item.id"  :msg="item.message" :name="item.fromUser.nickName" me="true" :filea="item.File"></FriendItem>
        <MyItem v-else :messageid="item.id"  :msg="item.message" :name="item.fromUser.nickName" :filea="item.File" ></MyItem>
      </div>
    </div>

    <!-- 聊天底部 -->
    <van-tabbar>
      <van-tabbar-item >
        <input placeholder="输入信息" v-model="message" class="input"/>
        <van-button @click="sendMsg" plain type="info" >发送</van-button>
        <div class="bottom" >
          <van-dropdown-menu direction="up">
            <van-dropdown-item ref="item">
              <van-uploader accept="image/gif,image/jpeg,image/jpg,image/png" :before-read="beforeReadImg" :after-read="afterReadImg">
                <van-button type="primary" plain class="file-sending">图片</van-button>
              </van-uploader >
              <van-uploader accept=".xls,.doc,.txt,.pdf,.gif,.jpeg,.jpg,.png" result-type="dataUrl" :before-read="beforeReadFile" :after-read="afterReadFile">
                <van-button type="primary" plain class="file-sending">文件</van-button>
              </van-uploader >
              <van-button block type="info" @click="onConfirm" plain>返回</van-button>
            </van-dropdown-item>
          </van-dropdown-menu>
        </div>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import {sendMessage, getHistoryReadList, getUnreadMessageList} from "@/api/friendOperation"
import FriendItem from "./FriendItem"
import MyItem from './MyItem';
import { type } from 'os';
import Data from 'vue';

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
      pic:this.$route.params.avatar,

      friendName:this.$route.params.name,
      myNickName:this.$store.getters.userNickname,
      friendNickName:this.$route.params.name,
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
      this.$websocket.state.privateUnreadNumber[this.friendId] = null;
      this.$websocket.dispatch("StartChatId", [this.friendId, "private"]);
      this.getUnreadList(this.$store.getters.userId, this.$route.params.friendId);
      this.websockOnMessage();
    },
    //显示结果进度
    showProcess(){
      console.log("全部", this.total)
      console.log("当前", this.fileUpload.cuLoaded)
      var percent = (this.fileUpload.cuLoaded / this.total) * 100;
      console.log("####文件传输百分比", percent)
      // document.getElementById('Status').innerText = percent;
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
    websockOnMessage() {
      let param = null;
      this.$websocket.state.websock.onmessage = e => {
        // const data = JSON.parse(e.data);
        console.log("###########又得开始看返回，生气", e)
        // const data = JSON.parse(e.data);
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
          console.log('开始上传数据........');
          this.bindReader();
        } else if (page.test(data) && (this.ff==1)) {
          // this.fileUrl = data;
          console.log("喵dd3.0");
          this.sendFile(data)
          this.ff=0;
        } else if (data == 'canceled') {
          console.log("喵dd4.0");
          console.log('取消上传数据........');
          this.fileUpload.cuLoaded = 0;
          this.showProcess();
          this.fileUpload.enableRead = false;
          this.reader.abort();
        } else if (data == 'ok') {
          console.log("喵dd5.0");
          if (this.fileUpload.cuLoaded < this.total) {
            this.readBlob();
          } else {
            this.$websocket.dispatch("SendWebsocketFileMessage", 'act:complete');
            console.log('总共上传：' + this.fileUpload.cuLoaded + ',总共用时：' + (new Date().getTime() - this.startTime.getTime()) / 1000);
          }
          this.showProcess();
        }
        // else {
        //   const
        console.log("喵dd2",e);
        data = JSON.parse(e.data);
          // if (data.data) {
          if (data.data.type !== "REGISTER" && data.status === 200) {
            if (!data.data.toGroupId && data.data.fromUserId == this.friendId) {
              let msgId = -1;
              if (data.data.type === "SINGLE_SENDING") {
                let dat = data.data;
                msgId = 0;
                param = {
                  "fromUser": {
                    "id": this.$route.params.friendId,
                    "nickName": this.$route.params.name,
                  },
                  "toUser": {
                    "id": this.$store.getters.userId,
                    "nickName": this.$store.getters.userNickname,
                  },
                  "message": dat.content,
                  "id": msgId
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
                    "id": msgId
                  };
                } else {
                  let dat = data.data;
                  msgId = 2;
                  param = {
                    "fromUser":{"id":this.$route.params.friendId,
                      "nickName": this.$route.params.name,
                    },
                    "toUser":{"id":this.$store.getters.userId,
                      "nickName":this.$store.getters.userNickname,
                    },
                    // "message":dat.content,
                    "message":JSON.parse(dat.content),
                    "id": msgId
                  };
                }
              //添加到信息列表，以便展示信息
              if (!this.messageList) {
                this.messageList = [param];
              } else {
                this.messageList.push(param);
              }
              print(this.messageList, "消息列表嗷嗷")
              this.currendStartChatList.push(data.data)
            } else {
              let re = /SINGLE/;
              if (re.test(data.data.type) === true) {
                this.$toast({
                  message: "新的好友信息，请注意查看",
                  position: "top",
                })
                if (this.$websocket.state.privateMessage.find((val, ind) => ind == data.data.fromUserId) != null || this.$websocket.state.privateMessage.find((val, ind) => ind == data.data.fromUserId) != undefined) {
                  this.$websocket.state.privateMessage[data.data.fromUserId].push(data.data);
                  this.$websocket.state.privateUnreadNumber[data.data.fromUserId] = (+this.$websocket.state.privateUnreadNumber[data.data.fromUserId]) + 1;
                } else {
                  this.$websocket.state.privateMessage[data.data.fromUserId] = [data.data];
                  this.$websocket.state.privateUnreadNumber[data.data.fromUserId] = +1;
                }
              } else {
                this.$toast({
                  message: "新的群信息，请注意查看",
                  position: "top",
                })
                if (this.$websocket.state.groupMessage.find((val, ind) => ind == data.data.toGroupId) != null || this.$websocket.state.groupMessage.find((val, ind) => ind == data.data.toGroupId) != undefined) {
                  this.$websocket.state.groupMessage[data.data.toGroupId].push(data.data);
                  this.$websocket.state.groupUnreadNumber[data.data.toGroupId] = this.$websocket.state.groupUnreadNumber[data.data.toGroupId] + 1;
                } else {
                  this.$websocket.state.groupMessage[data.data.toGroupId] = [data.data];
                  this.$websocket.state.groupUnreadNumber[data.data.toGroupId] = +1;
                }
              }
            }
          }
        // }
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
          msgId = 0;
          if (data.fromUserId === this.friendId) {
            param = {
              "fromUser":{"id":this.$route.params.friendId,
                          "nickName": this.$route.params.name,
                          },
              "toUser":{"id":this.$store.getters.userId,
                        "nickName":this.$store.getters.userNickname,
                        },
              "message":data.content,
              "id": msgId
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
              "id": msgId
            };
          }
        }
        else if (data.type === "SINGLE_SENDING_IMG"){
          msgId = 1;
          if (data.fromUserId === this.friendId) {
            console.log("第三步")
            param = {
              "fromUser":{"id":this.$route.params.friendId,
                          "nickName": this.$route.params.name,
                          },
              "toUser":{"id":this.$store.getters.userId,
                        "nickName":this.$store.getters.userNickname,
                        },
              "message":data.content,
              "id": msgId
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
              "id": msgId
            };
          }
        }
        // else if(data.type === "SINGLE_SENDING_FILE"){
        else{
          msgId = 2;
          if (data.fromUserId === this.friendId) {
            param = {
              "fromUser":{"id":this.$route.params.friendId,
                "nickName": this.$route.params.name,
              },
              "toUser":{"id":this.$store.getters.userId,
                "nickName":this.$store.getters.userNickname,
              },
              // "message":data.content,
              "message":JSON.parse(data.content),
              "id": msgId
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
              // "message":data.content,
              "message":JSON.parse(data.content),
              "id": msgId
            };
            console.log("嘿2",JSON.parse(data.content));
          }
        }
        this.messageList.push(param);
        console.log("第四步")
      })
    },
    sendMsg(){
      let data = null;
      let param = null;
      if (this.message.trim() === "" && this.imageFile.trim() === "" && this.File === null){
        this.$toast({
          message: "输入信息不能为空",
          position:"top"
        });
        return
      }
        if(this.imageFile !== "") {
        data = {
          "fromUserId" : ""+this.userId,
          "toUserId" : ""+this.friendId,
          "content": this.imageFile,
          "type" : "SINGLE_SENDING_IMG"
        };
        console.log("第五步")
        param = {
          "fromUser":{"id":this.$store.getters.userId,
                      "nickName":this.$store.getters.userNickname,
          },
          "toUser":{"id":this.$route.params.friendId,
                    "nickName":this.$route.params.name,
          },
          "message":this.imageFile,
          "id": 1
        };
          this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.friendId])
            .then(res => {
              this.currendStartChatList.push(data);
              this.messageList.push(param);
            });
      } else if(this.message !== ""){
        data = {
          "fromUserId" : ""+this.userId,
          "toUserId" : ""+this.friendId,
          "content" : ""+this.message,
          "type" : "SINGLE_SENDING"
        };
        param = {
          "fromUser":{"id":this.$store.getters.userId,
                      "nickName":this.$store.getters.userNickname,
          },
          "toUser":{"id":this.$route.params.friendId,
                    "nickName":this.$route.params.name,
          },
          "message":this.message,
          "id": 0
        };
          this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.friendId])
            .then(res => {
              this.currendStartChatList.push(data);
              this.messageList.push(param);
            });
      }
      else {
          this.$websocket.dispatch("SendWebsocketFileName", this.File.name);
        }
      // this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.friendId]);
      // this.currendStartChatList.push(data);
      // this.messageList.push(param);
      this.message = "";
      this.imageFile = "";
      // this.file = "";
      this.websockOnMessage();
    },
    sendFile(fileUrl){
      //文件部分
      let data = {
        "fromUserId" : ""+this.userId,
        "toUserId" : ""+this.friendId,
        "content" : JSON.stringify({
          "fileName": this.File.name,
          "fileSize": this.File.size,
          "fileUrl": fileUrl
        }),
        "type" : "FILE_MSG_SINGLE_SENDING"
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
        "id": 2
      };
      this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.friendId]);
      this.currendStartChatList.push(data);
      this.messageList.push(param);
      this.File = null;
      this.fileUpload.cuLoaded = 0;
      this.fileUpload.enableRead = true;
    },

    beforeReadImg(file, detail){
      console.log("第一步")
      return true;
    },
    afterReadImg(file, detail){
      if (file.file.size > 65530) {
        this.$toast({
          message: "图片过大，请转换为文件发送",
          position: "top",
        })
        return
      }
      this.imageFile = file.content;
      this.sendMsg()
    },
    beforeReadFile(file, detail){
      return true;
    },
    afterReadFile(file, detail){
      this.ff=1

      console.log("!!!!!!!!!!喵喵喵喵!!!!!!!!!!!",file);
      console.log("文件file",file)
      // console.log("文件file.file",file.file)
      this.File=file.file;

      this.total=file.file.size;
      this.sendMsg()
    },
    onConfirm(){
      this.$refs.item.toggle();
    },
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
            }
            //要是未读信息是图片咋整
            else if (data.type == "1") {
              t.fromUser = data.fromUser;
              t.message = data.message;
              t.id = 1;
            }
            //要是未读消息的文件
            else if(data.type == "2") {
              //只能先留口子
              t.fromUser = data.fromUser;
              t.message = data.message;
              t.id = 2;
              console.log("文件未读",t)
            }
            if(!this.messageList){
              this.messageList = [t];
            }else{
              this.messageList.push(t);
            }
          })
        }
        this.ParparePrivateChatMessage()
      }).catch()
    },
    onClickLeft(){
      this.$router.push({path:"/friendList"});
    },
  },
}
</script>

<style lang="scss" socped>
#body{
  margin:0.1rem 0.1rem 0rem 0.1rem;
  width:98%;
  height: 84.5%;
  background-color:rgb(250, 250, 250);
  margin-bottom: 1.45rem;
  overflow:auto;
}
.chatPage{
    height: 100%
}
.input{
    background-color: rgb(250, 250, 250); line-height:180%; font-size:0.5rem;
}
.bottom{
  width:0.5rem; float:right
}
.file-sending{
  padding-left:4.5rem;padding-right:4.5rem
}
</style>

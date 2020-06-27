<template>
  <div class="chatPage" style="height: 100%">
    <!-- 聊天顶部 -->
    <van-nav-bar
      :title= friendName
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />

    <!-- 聊天内容主体 -->
    <div id="body">
      <div v-for="(item, ind) in this.messageList" :key="ind">
        <FriendItem v-if="item.fromUser.id == userId" :messageid="item.id"  :msg="item.message" :name="item.fromUser.nickName" me="true" ></FriendItem>
        <MyItem v-else :messageid="item.id"  :msg="item.message" :name="item.fromUser.nickName"></MyItem>
      </div>
    </div>

    <!-- 聊天底部 -->
    <van-tabbar>
      <van-tabbar-item >
        <input placeholder="输入信息" v-model="message" style="background-color: rgb(250, 250, 250); line-height:180%; font-size:0.5rem"/>
        <van-button @click="sendMsg" plain type="info" >发送</van-button>
        <div style="width:0.5rem; float:right">
          <van-dropdown-menu direction="up">
            <van-dropdown-item ref="item">
              <van-uploader accept="image/gif,image/jpeg,image/jpg,image/png" :before-read="beforeReadImg" :after-read="afterReadImg">
                <van-button type="primary" plain style="padding-left:4.6rem;padding-right:4.6rem" >图片</van-button>
              </van-uploader >
              <van-uploader accept=".xls,.doc,.txt,.pdf" result-type="dataUrl" :before-read="beforeReadFile" :after-read="afterReadFile">
                <van-button type="primary" plain style="padding-left:4.6rem;padding-right:4.6rem" >文件</van-button>
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
      websock: null,
      historyMessageList:[],    //历史消息列表
      unreadList:[],    //未读消息列表
      pic:this.$route.params.avatar,
      friendId:""+this.$route.params.friendId,
      userId:this.$store.getters.userId,
      messageList:[],
      unreadLeaveFriend:this.$store.getters.leaveMessage,
      friendName:this.$route.params.name,
      imageFile: "",
      file:null,
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
    websockOnMessage() {
      let param = null;
      this.$websocket.state.websock.onmessage = e => {
        const data = JSON.parse(e.data);
        if (data.status === -1) {
          return
        }
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
            } else if (data.data.type === "SINGLE_SENDING_IMG") {
              let dat = data.data;
              msgId = 1;
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
            } else if (data.data.type === "SINGLE_SENDING_FLIE") {
              let dat = data.data;
              msgId = 2;
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
                //留下口子
              };
            }
              //添加到信息列表，以便展示信息
              if (!this.messageList) {
                this.messageList = [param];
              } else {
                this.messageList.push(param);
              }
              print(this.messageList,"消息列表嗷嗷")
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
        else if(data.type === "SINGLE_SENDING_FILE"){
          msgId = 2;
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
        this.messageList.push(param);
        console.log("第四步")
      })
    },
    sendMsg(){
      let data = null;
      let param = null;
      if (this.message.trim() === "" && this.imageFile.trim() === "" && !this.file){
        this.$toast({
          message: "输入信息不能为空",
          position:"top"
        });
        return
      }
      if (this.file) {
        data = {
          "fromUserId": "" + this.userId,
          "toUserId": "" + this.friendId,
          "content": this.file,
          // "originalFileName": "" + this.fileName[0],
          // "fileUrl": "" + this.fileName[1],
          // "fileSize": "" + this.file[2],
          "type": "SINGLE_SENDING_FILE"
        };
        console.log("aaaaaaa")
        console.log(this.file)
        param = {
          "fromUser": {
            "id": this.$store.getters.userId,
            "nickName": this.$store.getters.userNickname,
            },
            "toUser": {
              "id": this.$route.params.friendId,
              "nickName": this.$route.params.name,
            },
            "message": this.file,
            "id": 2
          }
      } else if(this.imageFile !== "") {
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
      }
      if(this.message !== ""){
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
      }
      this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.friendId]);
      this.currendStartChatList.push(data);
      this.messageList.push(param);
      this.message = "";
      this.imageFile = "";
      this.file = "";
      this.websockOnMessage();
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
      console.log("!!!!!!!!!!!!!!!!!!!!!",file);
      // console.log("@@@@@@@", detail)
      // let url = URL.createObjectURL(file)
      // console.log(url)
      // this.fileName = [file.name,file,file.size];
      console.log("文件file",file)
      console.log("文件file.file",file.file)
      // let uploadUrl = URL.createObjectURL(file)
      // console.log("??",dataUrl)
      // let reader =new FileReader()
      //
      // reader.onload=function (e) {
      //     this.file=e.target.result
      //     console.log("喵?",this.file)
      // }
      // reader.readAsDataURL(data)
      // console.log("喵miao?",this.file)
      this.file=file
      this.sendMsg()
    },
    onConfirm(){
      this.$refs.item.toggle();
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

<style socped>
#body{
  margin:0.1rem 0.1rem 0rem 0.1rem;
  width:98%;
  height: 84.5%;
  background-color:rgb(250, 250, 250);
  margin-bottom: 1.45rem;
  overflow:auto;
}
</style>

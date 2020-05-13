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
        <FriendItem v-if="item.fromUser.id == userId" :messageid="item.id" :img="item.fromUser.avatar" me="true" :msg="item.message" :name="item.fromUser.nickName"></FriendItem>
        <MyItem v-else :img="item.fromUser.avatar" :messageid="item.id" :msg="item.message" :name="item.fromUser.nickName"></MyItem>
      </div>
    </div>
    
    <!-- 聊天底部 -->
    <van-tabbar>
      <van-tabbar-item >
        <input placeholder="输入信息" v-model="message" style="background-color: rgb(250, 250, 250); line-height:180%; font-size:0.5rem"/>
        <!-- <button @click="sendMsg" style="padding:0.22rem">发送</button> -->
        <van-button @click="sendMsg" plain type="info" >发送</van-button>
        <div style="width:0.5rem; float:right">
          <van-dropdown-menu direction="up">
            <van-dropdown-item ref="item">
              <van-uploader :before-read="beforeReadImg" :after-read="afterReadImg">
                <van-button type="primary" plain style="padding-left:3.9rem;padding-right:3.9rem" >上传图片</van-button>
              </van-uploader >
              <van-uploader accept=".xls,.doc,.txt,.pdf" result-type="file" :before-read="beforeReadFile" :after-read="afterReadFile">
                <van-button type="primary" plain style="padding-left:3.9rem;padding-right:3.9rem" >上传文件</van-button>
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
      // messageId : 1,
      friendName:this.$route.params.name,
      // files:null,
      imageFile:[],
      fileName:[],
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
  methods: {
    init(){
      this.$websocket.state.privateUnreadNumber[this.friendId] = undefined;
      this.$websocket.dispatch("StartChatId", [this.friendId, "private"]);
      this.getUnreadList(this.$store.getters.userId, this.$route.params.friendId);
      // this.ParparePrivateChatMessage();
      this.websockOnMessage();
    },
    websockOnMessage(){
      let param = null;
      this.$websocket.state.websock.onmessage = e =>{
        const data = JSON.parse(e.data);
        console.log("得到的数据啊", data);
        if(data.status === -1){
          // this.$toast({
          //   message:"请注意，用户离线",
          //   position:"top"
          // })
          // this.websockOnMessage();
          return;
        }
        if(data.data.type !== "REGISTER" && data.status === 200){
          if (data.data.fromUserId == this.friendId){
            let msgId = -1;
            if(data.data.type === "SINGLE_SENDING"){
              let dat = data.data;
              msgId = 0;
              param = {
                "fromUser":{"id":this.$route.params.friendId,
                            "nickName": this.$route.params.name,
                            "avatar":this.$route.params.avatar}, 
                "toUser":{"id":this.$store.getters.userId, 
                          "nickName":this.$store.getters.userNickname, 
                          "avatar": this.$store.getters.userAvatar}, 
                "message":dat.content,
                "id": msgId
              };
            }
            else if (data.data.type === "SINGLE_SENDING_IMG"){
              //先留下口子
            } else {return;}

            //添加到信息列表，以便展示信息
            if (! this.messageList){
              this.messageList = [param];
            }
            else{
              this.messageList.push( param );
            }
            this.currendStartChatList.push(data.data)
            // console.log("得到的数据放入数组中了", this.currendStartChatList)
          } else{
              this.$toast({
                message:"新的好友信息，请注意查看",
                position:"top",
              })
            // console.log("外人发来信息展示之前", this.$websocket.state.privateMessage)
            if(this.$websocket.state.privateMessage.find((val, ind) => {return (""+ind) === data.data.fromUserId })){
              this.$websocket.state.privateMessage[data.data.fromUserId].push(data.data);
              this.$websocket.state.privateUnreadNumber[data.data.fromUserId] = this.$websocket.state.privateUnreadNumber[data.data.fromUserId] + 1;
            } else{
              this.$websocket.state.privateMessage[data.data.fromUserId] = [data.data];
              this.$websocket.state.privateUnreadNumber[ata.data.fromUserId] = 1;
            }
            // console.log("其他人发送消息以后是否更新", this.$websocket.state.privateMessage)
          }
        }
      }
    },
    ParparePrivateChatMessage(){
      //初始化数据吧
      if (!this.currendStartChatList) {
        // this.currendStartChatList = [];
        return ;
      }
      let param = null, msgId = -1;
      this.$websocket.state.privateUnreadNumber[this.friendId] = 0
      this.currendStartChatList.forEach(data => {
        if(data.type === "SINGLE_SENDING"){
          msgId = 0;
          console.log("!!!!!!", typeof data.fromUserId, typeof this.friendId)
          if (data.fromUserId === this.friendId) {
            param = {
              "fromUser":{"id":this.$route.params.friendId,
                          "nickName": this.$route.params.name,
                          "avatar":this.$route.params.avatar
                          }, 
              "toUser":{"id":this.$store.getters.userId, 
                        "nickName":this.$store.getters.userNickname, 
                        "avatar": this.$store.getters.userAvatar
                        }, 
              "message":data.content,
              "id": msgId
            };
          }
          else {
            param = {
              "fromUser":{"id":this.$store.getters.userId, 
                          "nickName":this.$store.getters.userNickname, 
                          "avatar": this.$store.getters.userAvatar
                          },
              "toUser":{"id":this.$route.params.friendId,
                        "nickName": this.$route.params.name,
                        "avatar":this.$route.params.avatar
                        }, 
              "message":data.content,
              "id": msgId
            };
          }
        }
        else if (data.type === "SINGLE_SENDING_IMG"){
          //先留下口子
        }
        this.messageList.push(param);
      })
    },
    sendMsg(){
      let data = null;
      let param = null;
      if (this.message.trim() === "" && this.imageFile.length < 3 && this.fileName.length < 3){
        this.$toast("输入信息不能为空");
        return
      }
      if (this.fileName.length === 3) {
        data = {
          "fromUserId" : ""+this.userId,
          "toUserId" : ""+this.friendId,
          "originalFileName" : ""+this.fileName[0],
          "fileUrl":"" + this.fileName[1],
          "fileSize":"" + this.file[2],
          "type" : "FILE_IMG_SINGLE_SENDING"
        };
        param = {
          "fromUser":{"id":this.$store.getters.userId,
                      "nickName":this.$store.getters.userNickname,
                      "avatar":this.$store.getters.userAvatar}, 
          "toUser":{"id":this.$route.params.friendId, 
                    "nickName":this.$route.params.name, 
                    "avatar":this.$route.params.avatar}, 
          "message":this.fileName,
          "id": 2
        }
      }
      if(this.imageFile.length === 3){
        data = {                    
          "fromUserId" : ""+this.userId,
          "toUserId" : ""+this.friendId,
          "originalFileName":"" + this.imageFile[0],
          "fileUrl": "" + this.imageFile[1],
          "fileSize":"" + this.imageFile[2],
          "type" : "FILE_IMG_SINGLE_SENDING"
        };
        param = {
          "fromUser":{"id":this.$store.getters.userId,
                      "nickName":this.$store.getters.userNickname,
                      "avatar":this.$store.getters.userAvatar}, 
          "toUser":{"id":this.$route.params.friendId, 
                    "nickName":this.$route.params.name, 
                    "avatar":this.$route.params.avatar}, 
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
                      "avatar":this.$store.getters.userAvatar}, 
          "toUser":{"id":this.$route.params.friendId, 
                    "nickName":this.$route.params.name, 
                    "avatar":this.$route.params.avatar}, 
          "message":this.message,
          "id": 0
        };
      }
      this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.friendId]);
      this.currendStartChatList.push(data);
      // console.log(this.currendStartChatList)
      this.messageList.push(param);
      this.message = "";
      this.imageFile = [];
      this.fileName = []
      this.websockOnMessage();
    },
    beforeReadImg(file, detail){
      return true;
    },
    afterReadImg(file, detail){
      // let url = URL.createObjectURL(file);
      // console.log(url);
      this.imageFile = [file.name, file.content, file.size];
      this.sendMsg()
      // console.log("!!!!!!!!!!!!!!!!!!!!!",file);
      // console.log("@@@@@@@", detail)
    },
    beforeReadFile(file, detail){
      return true;
    },
    afterReadFile(file, detail){
      console.log("!!!!!!!!!!!!!!!!!!!!!",file);
      // console.log("@@@@@@@", detail)
      // let url = URL.createObjectURL(file)
      // console.log(url)
      this.fileName = [file.name,file,file.size];
      this.sendMsg()
    },
    onConfirm(){
      this.$refs.item.toggle();
    },
    getTime(){
      let myTime = new Date('December 17, 1995 03:24:00');
      let y = myTime.getFullYear();
      let m = myTime.getMonth() + 1;
      let d = myTime.getData();
      let h = myTime.getHours();
      let min = myTime.getMinutes();
      let s = myTime.getSeconds();
      let t = y + '-' + m + '-' + d + ' ' + h + ':' + min + ':' + s;
      return t;
    },
    getUnreadList(fromId, toId){
      getUnreadMessageList(fromId, toId).then(response =>{
        this.unreadList = response.data.data;
        // console.log("getUnreadList接受到的具体未读信息", this.unreadList);
        // console.log(fromId, response);
        if(this.unreadList){
          this.unreadList.forEach((data) =>{
            let t = {};
            if (data.type == "0") {
              t.fromUser = data.fromUser;
              // t.toUser = data.toUser;
              t.message = data.message;
              t.id = 0;
            }
            //要是未读信息是图片咋整
            else if (data.type == "1") {
              t.fromUser = data.fromUser;
              // t.toUser = data.toUser;
              t.message = data.message;
              t.id = 1;
            }
            //要是未读消息的文件
            else if(data.type == "2") {
              //只能先留口子
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
      this.$router.back();
    }
  },
  // mounted() {
  //   this.init();
  // },
  beforeMount() {
    // console.log(this);
    this.init();
  },
  beforeDestroy(){
    this.$websocket.state.privateMessage[this.friendId] = this.currendStartChatList;
    this.$websocket.dispatch("StopChatId");
  }
};
</script>

<style socped>
#body{
  margin:0.1rem 0.1rem 0rem 0.1rem;
  width:98%;
  height: 84%;
  background-color:rgb(250, 250, 250);
  margin-bottom: 1.5rem;
  overflow:auto;
}
</style>
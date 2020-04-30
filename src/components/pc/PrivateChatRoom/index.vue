<template>
  <el-container>

    <el-header style="height:auto">
      <p style="font-size:0.7rem;margin:0 0 auto;">{{this.$route.params.name}}</p>
    </el-header>

    <el-main style="margin:0 0.1rem 1.2rem 0.1rem;width:98%;padding-top:0.1rem">
      <div v-for="(item, ind) in this.messageList" :key="ind">
          <FriendItem v-if="item.fromUser.id == userId" :messageid="item.id" :img="item.fromUser.avatar" me="true" :msg="item.message" :name="item.fromUser.nickName"></FriendItem>
          <MyItem v-else :img="item.fromUser.avatar" :messageid="item.id" :msg="item.message" :name="item.fromUser.nickName"></MyItem>
      </div>
    </el-main>

    <el-footer> 
      <el-dropdown trigger="click" style="margin-right:0.3rem">
        <el-button type="primary" plain>
          上传<i class="el-icon-arrow-up el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown" >

          <el-dropdown-item style="display:relative">
            <input type="file" name="file" id="file" class="inputfile" @change="handleFile($event)" />
            <label for="file">上传文件</label>
          </el-dropdown-item>

          <el-dropdown-item style="display:relative">
            <input type="file" name="image" id="image" class="inputfile" @change="handleFile($event)" />
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

export default {
  components: {
      MyItem,
      FriendItem
  },
  data() {
    return { 
      message: "",
      imageFile: "",
      websock: null,
      historyMessageList:[],    //历史消息列表
      unreadList:[],    //未读消息列表
      pic:this.$route.params.avatar,
      friendId:""+this.$route.params.friendId,
      userId:this.$store.getters.userId,
      messageList:[],
      myNickName:this.$store.getters.userNickname,
      myAvator:this.$store.getters.userAvatar,
      friendNickName:this.$route.params.name,
      friendAvator:this.$route.params.avatar,
      // currendStartChatList:this.$websocket.getters.privateMessage(this.friendId),
      // sendImage:this.sendMsg,
      // messageId : 1,
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
    // otherChatList:{
    //   get(){
    //     return this.$websocket.state.privateMessage
    //   },
    //   set(){
    //   }
    // }
  },
  methods: {
    init(){
      // console.log(typeof this.friendId)
      //要把未读数清零
      this.$websocket.state.privateUnreadNumber[this.friendId] = 0;
      this.$websocket.dispatch("StartChatId", [this.friendId, "private"]);
      this.getUnreadList(this.$store.getters.userId, this.$route.params.friendId);
      // this.ParparePrivateChatMessage();
      this.websockOnMessage();
    },
    websockOnMessage(){
      let param = null;
      this.$websocket.state.websock.onmessage = e =>{
        const data = JSON.parse(e.data);
        // console.log("得到的数据啊", data);
        if (data.status === -1) {
          return
        }
        if(data.data.type !== "REGISTER" && data.status === 200){
          if (data.data.fromUserId == this.friendId){
            // console.log("难道走了这儿")
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
          // else if (data.data.fromUserId !== this.friendId){
            //不是自己这个聊天框的信息，怎么处理。
            this.$message("新的好友信息，请注意查看");
            // console.log("外人发来信息展示之前", this.$websocket.state.privateMessage)
            if(this.$websocket.state.privateMessage.find((val, ind) => {return (""+ind) === data.data.fromUserId })){
              this.$websocket.state.privateMessage[data.data.fromUserId].push(data.data);
              this.$websocket.state.privateUnreadNumber[data.data.fromUserId] = this.$websocket.state.privateUnreadNumber[data.data.fromUserId] + 1;
            } else{
              this.$websocket.state.privateMessage[data.data.fromUserId] = [data.data];
              this.$websocket.state.privateUnreadNumber[ata.data.fromUserId] = 1;
            }
            // if(this.otherChatList.find((val, ind) => {
            //   console.log("ind", typeof ind, ind);
            //   console.log("fromUser", typeof data.data.fromUserId, data.data.fromUserId)
            //   return ind === data.data.fromUserId })){
            //   this.otherChatList[data.data.fromUserId].push(data.data);
            // } else{
            //   this.otherChatList[data.data.fromUserId] = [data.data];
            // }
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
    handleFile(event){
      let data = event.target.files[0];
      // console.log(data);
      let toId = this.$route.params.friendId;
      if(/.jpg|.jpeg|.png|.img/ig.test(data.name)){
        //处理图片
        let me = this;
        //方式一：内存url   eg:blob:http://localhost:8080/b077141c-9d62-487b-9e3a-c8b93058aa10
        me.imageFile = URL.createObjectURL(data);
        console.log(me.imageFile);
        me.sendMsg();
        
        //方式二：filereader
        // let reader = new FileReader();
        // reader.onload = function(e){
          
        //   console.log("读取到的图片",e)
        //   me.imageFile = e.target.result;
        //   me.sendMsg();
        // } 
        // reader.readAsDataURL(data);
        //唉到底选哪个啊

      } else if(!data) {
        //没数据，退出
        return;
      } else{
        //处理文件
      }
    },
    sendMsg(){
      let data = null;
      let param = null;
      if (this.message.trim() === "" && this.imageFile.trim() === ""){
        this.$message.error("输入信息不能为空");
        return
      }
      if(this.imageFile !== ""){
        data = {                    
          "fromUserId" : ""+this.userId,
          "toUserId" : ""+this.friendId,
          "content" : ""+this.imageFile,
          "type" : "SINGLE_SENDING_IMG"
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
      this.imageFile = "";
      this.websockOnMessage();
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
        console.log("getUnreadList接受到的具体未读信息", this.unreadList);
        // console.log(fromId, response);
        if(this.unreadList){
          this.unreadList.forEach((data) =>{
            let t = {};
            if (!data.type || data.type === "SINGLE_SENDING") {
              t.fromUser = data.fromUser;
              t.toUser = data.toUser;
              t.message = data.message;
              t.id = 0;
            }
            //要是未读信息是文件图片咋整
            else if (data.type === "") {
              //先留下口子
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
  },
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
<style scoped>
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
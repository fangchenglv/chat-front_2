<template>
  <el-container>

    <el-header style="height:auto">
      <p style="font-size:0.7rem;margin:0 0 auto;">{{this.$route.params.name}}</p>
    </el-header>

    <el-main style="margin:0 0.1rem 1.2rem 0.1rem;width:98%;padding-top:0.1rem">
      <ul>
          <li v-for="item in this.messageList" :key="item.id" style="display:block">
            <ChatItem v-if="item.fromUser.id == userId" :img="item.fromUser.avatar" me="true" :msg="item.message" :name="item.fromUser.nickName"></ChatItem>
            <ChatItem v-else :img="item.fromUser.avatar" :msg="item.message" :name="item.fromUser.nickName"></ChatItem>
          </li>
      </ul>
    </el-main>

    <el-footer> 
      <i class="el-icon-folder" style="font-size:0.5rem"/>
      <el-input 
        v-model="message"
        @keyup.enter.native="sendMsg()" 
        style="width:60%"></el-input>
      <el-button 
        type="primary" 
        plain 
        @click="sendMsg()" 
      >发送</el-button>
    </el-footer>

  </el-container>
</template>

<script>
import {sendMessage, getHistoryReadList, getUnreadMessageList} from "@/api/friendOperation"
import ChatItem from "./ChatItem"
import { type } from 'os';
import Data from 'vue';

export default {
  components: {
      ChatItem,
  },
  data() {
    return { 
      message: "",
      websock: null,
      historyMessageList:[],    //历史消息列表
      unreadList:[],    //未读消息列表
      pic:this.$route.params.avatar,
      friendId:this.$route.params.friendId,
      userId:this.$store.getters.userId,
      messageList:[],
      messageId : 1,
      };
  },
  methods: {
    init(){
      this.websock = this.$store.getters.sock;
      this.getUnreadList(this.$store.getters.userId, this.$route.params.friendId);
      // console.log(this.websock);
      // this.websock.connect(JSON.stringify({"userId" : this.userId,"type" : "REGISTER"}));
      this.websockOnMessage();
    },
    websockOnMessage(){
      this.websock.ws.onmessage = e =>{
        const data = JSON.parse(e.data);
        console.log(e);
        // if (data.data){
        //   const dat = data.data;
        //   dat.id = this.messageId;
        //   if (! this.messageList){
        //     this.messageList = [dat];
        //   }
        //   else{
        //     this.messageList.push( dat );
        //   }
        //   this.messageId = this.messageId + 1; 
        // }else{
        //   return
        // }
      }
    },
    sendMsg(){
      const toId = this.$route.params.friendId;
      if(this.websock.status === 'open'){
        const data = {                    
          "fromUserId" : this.userId,
          "toUserId" : toId,
          "content" : this.message,
          "type" : "SINGLE_SENDING"};
        this.websock.sendHandle(JSON.stringify(data));
        console.log("发送数据", data);
        const param = {
          "fromUser":{"id":this.$store.getters.userId,
          "nickName":this.$store.getters.userNickname,
          "avatar":this.$store.getters.userAvatar}, 
          "toUser":{"id":this.$route.params.friendId, 
          "nickName":this.$route.params.name, 
          "avatar":this.$route.params.avatar}, 
          "message":this.message,
          "id":this.messageId};

        this.messageId = this.messageId + 1;
        this.messageList.push(param);
        this.message = "";
        this.websockOnMessage();
      }
    },
    getTime(){
      let myTime = new Data('December 17, 1995 03:24:00');
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
        if(this.unreadList){
          this.unreadList.forEach((data) =>{
            if(data.fromUser.id == this.userid){
              data.id = this.messageId;
              this.messageId = this.messageId + 1;
              if(!this.messageList){
                this.messageList = [data]; 
              }else{
                this.messageList.push(data);
              }
            }else{
              if(!this.messageList){
                this.messageList = [data]; 
              }else{
                this.messageList.push(data);
              }            
            }
          })
        }
      }).catch()
    },
  },
  mounted() {
    this.init();
    },
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
</style>
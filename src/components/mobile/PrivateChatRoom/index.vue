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
      <div v-for="item in this.messageList" :key="item.id">
        <FriendItem v-if="item.fromUser.id == userId" :img="item.fromUser.avatar" me="true" :msg="item.message" :name="item.fromUser.nickName"></FriendItem>
        <MyItem v-else :img="item.fromUser.avatar" :msg="item.message" :name="item.fromUser.nickName"></MyItem>
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
              <van-uploader :before-read="beforeRead" :after-read="afterRead">
                <van-button icon="photo" type="primary" plain style="padding-left:3.9rem;padding-right:3.9rem" >上传图片</van-button>
              </van-uploader >
              <van-button block type="info" @click="onConfirm" plain>确认</van-button>
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
      friendId:this.$route.params.friendId,
      userId:this.$store.getters.userId,
      messageList:[],
      messageId : 1,
      friendName:this.$route.params.name,
      files:null,
      };
  },
  watch:{
    files:function (file, oldfile) {
      console.log(file);
    }
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
        // console.log(e);
        console.log(data);
        // console.log(data.data);
        if (data.status == 200 && data.data.type == "SINGLE_SENDING" && data.data.fromUserId == this.$route.params.friendId){
          const dat = data.data;
          const param = {
          "fromUser":{"id":this.$route.params.friendId,
          "nickName": this.$route.params.name,
          "avatar":this.$route.params.avatar}, 
          "toUser":{"id":this.$store.getters.userId, 
          "nickName":this.$store.getters.userNickname, 
          "avatar": this.$store.getters.userAvatar}, 
          "message":dat.content,
          "id":this.messageId};

          if (! this.messageList){
            this.messageList = [param];
          }
          else{
            this.messageList.push( param );
          }
          this.messageId = this.messageId + 1; 
        }else{
          return
        }
      }
    },
    sendMsg(){
      const toId = this.$route.params.friendId;
      if(this.websock.status === 'open'){
        const data = {                    
          "fromUserId" : ""+this.userId,
          "toUserId" : ""+toId,
          "content" : ""+this.message,
          "type" : "SINGLE_SENDING"};
        this.websock.sendHandle(JSON.stringify(data));
        // console.log("发送数据", data);
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
    beforeRead(file, detail){
      // console.log("!!!!!!!!!!!!!!!!!!!!!",file, detail);
      return true;
    },
    afterRead(file, detail){
      console.log("!!!!!!!!!!!!!!!!!!!!!",file, detail);
    },
    onConfirm(){
      this.$refs.item.toggle();
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
    onClickLeft(){
      this.$router.push({name:"FriendPage", params:{id: this.$route.params.friendId}})
    }
  },
  mounted() {
    this.init();
    },
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
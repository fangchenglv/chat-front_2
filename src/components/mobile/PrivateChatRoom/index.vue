<template>
  <div>
    <van-nav-bar
      :title= friendName
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />
    <div id="body">
    </div>
    <van-tabbar>
      <van-tabbar-item >
        <input placeholder="输入信息" style="background-color: rgb(245, 245, 245); line-height:1rem; font-size:0.5rem"/>
        <van-button @click="sendMsg" type="primary" plain>发送</van-button>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import {sendMessage, getHistoryReadList, getUnreadMessageList} from "@/api/friendOperation"
import { type } from 'os';
import Data from 'vue';

export default {
  data() {
    //这里存放数据
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
      friendName: this.$route.params.name,
      };
  },
  mounted(){
    this.init();
  },
  //方法集合
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
    onClickLeft(){
      this.$router.push({name:'FriendPage', params:{id: this.$route.params.friendId}});
    }
  },
}
</script>

<style scoped>
#body{
}
</style>
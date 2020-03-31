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
      friendId:this.$route.params.friendId,
      userId:this.$store.getters.userId,
      messageList:[],
      myNickName:this.$store.getters.userNickname,
      myAvator:this.$store.getters.userAvatar,
      friendNickName:this.$route.params.name,
      friendAvator:this.$route.params.avatar,
      // sendImage:this.sendMsg,
      // messageId : 1,
      };
  },
  methods: {
    init(){
      this.websock = this.$store.getters.sock;
      this.getUnreadList(this.$store.getters.userId, this.$route.params.friendId);
      // console.log(this.sendImage);
      // this.websock.connect(JSON.stringify({"userId" : this.userId,"type" : "REGISTER"}));
      this.websockOnMessage();
    },
    websockOnMessage(){
      // this.websock.ws.onmessage = e =>{
      //   const data = JSON.parse(e.data);
      //   console.log("得到的数据啊", data);
      //   if (data.status === 200 && data.data.fromUserId == this.$route.params.friendId){
      //     let msgId = -1;
      //     if(data.data.type === "SINGLE_SENDING"){
      //       let dat = data.data;
      //       msgId = 0;
      //       let param = {
      //       "fromUser":{"id":this.$route.params.friendId,
      //       "nickName": this.$route.params.name,
      //       "avatar":this.$route.params.avatar}, 
      //       "toUser":{"id":this.$store.getters.userId, 
      //       "nickName":this.$store.getters.userNickname, 
      //       "avatar": this.$store.getters.userAvatar}, 
      //       "message":dat.content,
      //       "id": msgId
      //       };
      //     }
      //     else if (data.data.type === "SINGLE_SENDING_IMG"){//先留下口子
      //     } else {return;}

      //     //添加到信息列表，以便展示信息
      //     if (! this.messageList){
      //       this.messageList = [param];
      //     }
      //     else{
      //       this.messageList.push( param );
      //     }
      //     // this.messageId = this.messageId + 1; 
      //   } else if (data.status === 200 && data.data.fromUserId !== this.$route.params.friendId){
      //     //不是自己这个聊天框的信息，怎么处理。
      //   }
      // }
    },
    handleFile(event){
      let data = event.target.files[0];
      let toId = this.$route.params.friendId;
      if(/.jpg|.jpeg|.png|.img/ig.test(data.name)){
        //处理图片
        let me = this;
        let reader = new FileReader();
        reader.onload = function(e){
          me.imageFile = e.target.result;
          // console.log(me.imageFile);
          me.sendMsg();
        } 
        reader.readAsDataURL(data);
        // me.sendMsg();
        // console.log("!!!!!!!:1", "2", me.imageFile);
      } else if(!data) {
        //没数据，退出
        return;
      } else{
        //处理文件
      }
    },
    // var sendImage = sendMsg;
    sendMsg(){
      let data = null;
      let param = null;
      const toId = this.$route.params.friendId;
      if (this.message.trim() === "" && this.imageFile.trim() === ""){
        this.$message.error("输入信息不能为空");
        return
      }
      if(this.websock.status === 'open'){
        if(this.imageFile !== ""){
          data = {                    
          "fromUserId" : ""+this.userId,
          "toUserId" : ""+toId,
          "content" : ""+this.imageFile,
          "type" : "SINGLE_SENDING_IMG"};
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
          "toUserId" : ""+toId,
          "content" : ""+this.message,
          "type" : "SINGLE_SENDING"};
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
        
        this.websock.sendHandle(JSON.stringify(data));
        this.messageList.push(param);
        // console.log("11111", this.messageList);
        this.message = "";
        this.imageFile = "";
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
        // console.log(this.unreadList);
        if(this.unreadList){
          this.unreadList.forEach((data) =>{
            if(data.fromUser.id == this.userid){
              // data.id = this.messageId;
              // this.messageId = this.messageId + 1;
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
    // console.log(this);
    this.init();
    },
};
// console.log(this)
// var sendImage = vm.sendMsg;
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
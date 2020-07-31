<template>
  <el-container lang="scss">

    <el-header style="height:auto">
      <p style="font-size:0.7rem;margin:0 0 auto;">{{$route.params.name}}</p>
    </el-header>

    <el-main style="margin:0 0.1rem 1.2rem 0.1rem;width:98%;padding-top:0.1rem">
    <div v-if="File !== null" style="position:sticky; top:0">
            <strong style="padding-right:0.2rem">{{File.name}}</strong>
            <button @click="stop">暂停</button>
            <button @click="continueFile">继续</button>
            <a v-if="this.fileUpload.enableRead == false">已暂停</a>
            <a v-if="this.fileUpload.enableRead == true">传输中</a>
          </div>
      <div v-for="(item, ind) in this.messageList" :key="ind">
          <GroupFriendItem v-if="item.toUser" :messageid="item.id" :img="item.toUser.avatar" :msg="item.message" :name="item.toUser.nickName":time="item.time"></GroupFriendItem>
          <GroupMyItem v-else :messageid="item.id" :img="item.fromUser.avatar" me="true" :msg="item.message" :name="item.fromUser.nickName" :filea="item.File":time="item.time"></GroupMyItem>
      </div>
    </el-main>

    <el-footer> 
      <el-dropdown trigger="click" style="margin-right:0.3rem">
        <el-button type="primary" plain>
          上传<i class="el-icon-arrow-up el-icon--right"></i>
        </el-button>
        <el-dropdown-menu slot="dropdown" >

          <el-dropdown-item style="display:relative">
            <input type="file" accept=".xls,.doc,.txt,.pdf,.gif,.jpeg,.jpg,.png" name="file" id="file" class="inputfile" @change="handleFile($event)" />
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
import GroupFriendItem from "../groupChatPage/groupFriendItem";
import GroupMyItem from "../groupChatPage/groupMyItem";
import {sendMessage, getMyGroupChatPerson, getUnreadGroupMessageList } from "../../../api/friendOperation";
import { type } from 'os';
import Data from 'vue';

export default {
  components:{
    GroupFriendItem,
    GroupMyItem
  },
  data() {
    return { 
      message: "",
      imageFile: "",
      historyMessageList:[],    //历史消息列表
      unreadList:[],    //未读消息列表
      File: null,
      fileUrl: "",
      total:0,
      ff:0,
      reader:null,
      fileUpload:{
      cuLoaded: 0,
      step: 65536,
      enableRead: true
      },
      startTime: 0,
      readerObj: null,
      websock: null,
      userId:this.$store.getters.userId,
      messageList:[],
      myNickName:this.$store.getters.userNickname,
      groupId:"" + this.$route.params.groupId,
      userId:this.$store.getters.userId,
      newGroupFriend: this.$store.getters.myGroupFriends[this.$route.params.groupId],
      unreadLeaveFriend:this.$store.getters.leaveMessage,
    };
  },
  computed:{
    currendStartChatList:{
      get(){
        if (this.$websocket.getters.groupMessage(this.groupId) === undefined || this.$websocket.getters.groupMessage(this.groupId) === null) {
          return [];
        }
        return this.$websocket.getters.groupMessage(this.groupId)
      },
      set(val){
      }
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy(){
    this.$websocket.state.groupMessage[this.groupId] = this.currendStartChatList;
    this.$websocket.dispatch("StopChatId");
  },
  methods:{
    init(){
      this.$websocket.state.groupUnreadNumber[this.groupId] = null;
      this.$websocket.dispatch("StartChatId", [this.groupId, "group"]);
      this.getUnreadList(""+this.$store.getters.userId, ""+this.$route.params.groupId);
      this.websockOnMessage();
    },
    showProcess(){
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
websockOnMessage(){
      let param = null;
      this.$websocket.state.websock.onmessage = e =>{
        console.log("喵dd1.0");
        let data = e.data;
        const re = /^[0-9]+.?[0-9]*/;
        const page = /^.*\..*$/;
        if (data.status === -1) {
          return
        }
        if (re.test(data)) {
                  this.fileUpload.cuLoaded = parseInt(data);
                  console.log('当前已上传：' + this.fileUpload.cuLoaded);
                  this.showProcess();
                  console.log('开始上传数据........');
                  this.bindReader();
                } else if(page.test(data)&& (this.ff==1)){
                  // this.fileUrl = data;
                  this.sendFile(data);
                  this.ff=0;
                }
                else if(data=='canceled'){
                  console.log('取消上传数据........');
                  this.fileUpload.cuLoaded = 0;
                  this.showProcess();
                  this.fileUpload.enableRead = false;
                  this.reader.abort();
                } else if(data=='ok'){
                  if (this.fileUpload.cuLoaded < this.total) {
                    this.readBlob();
                  } else {
                    this.$websocket.dispatch("SendWebsocketFileMessage" ,'act:complete');
                    console.log('总共上传：' + this.fileUpload.cuLoaded + ',总共用时：' + (new Date().getTime() - this.startTime.getTime()) / 1000);
                  }
                  this.showProcess();
                }
           data = JSON.parse(e.data);
          if( data.data.type !== "REGISTER" &&data.status === 200){
           console.log("喵dd1.5");
          if (data.data.toGroupId == this.groupId){
          console.log("喵dd2.0",data.data);
            let msgId = -1;
            if(data.data.type === "GROUP_SENDING"){
            console.log("喵dd3.0");
              let dat = data.data;
              msgId = 0;
              param = {
                "toUser":{"id":+dat.fromUserId,
                          "nickName":this.newGroupFriend[+dat.fromUserId].friendName,
                          },
                "message":dat.content,
                "id": msgId,
                "time":dat.time,
              };
            }
            else if (data.data.type === "GROUP_SENDING_IMG"){
              let dat = data.data;
              msgId = 1;
              param = {
                "toUser":{"id":+dat.fromUserId,
                          "nickName":this.newGroupFriend[+dat.fromUserId].friendName,
                          },
                "message":dat.content,
                "id": msgId,
                "time":dat.time,
              };
            } else {
                let dat = data.data;
                msgId = 2;
                param = {
                  "toUser":{"id":+dat.fromUserId,
                             "nickName":this.newGroupFriend[+dat.fromUserId].friendName,
                            },
                  "message":JSON.parse(dat.content),
                  "id": msgId,
                  "time":dat.time,
                  };
                  console.log("这里能下载吗", "https://65.49.204.236/group1/"+JSON.parse(dat.content).fileUrl);
                  // let routeData ="https://65.49.204.236/group1/"+JSON.parse(dat.content).fileUrl;
                  // window.open(routeData, '_blank');
            }
            //添加到信息列表，以便展示信息

            if (! this.messageList){
              this.messageList = [param];
            } else {
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
    getGroupFriend(data){
      getMyGroupChatPerson(this.$route.params.groupId).then((res) => {
        let oldGroupFriend = res.data.data
        for (let i = 0; i < oldGroupFriend.length; i++) {
          let tmp = {
            friendId: oldGroupFriend[i].user.id,
            friendName: oldGroupFriend[i].user.nickName,
          }
          res[""+oldGroupFriend[i].user.id] = tmp
          this.newGroupFriend[""+oldGroupFriend[i].user.id] = tmp
        }
        this.$store.state.myGroupFriends[this.groupId] = this.newGroupFriend;
        //重新得到群成员要展示
        let msgId = -1;
        if(data.data.type === "GROUP_SENDING"){
          let dat = data.data;
          msgId = 0; 
          param = {
            "toUser":{"id":+dat.fromUserId, 
                      "nickName":this.newGroupFriend[+dat.fromUserId].friendName, 
                      },
            "message":dat.content,
            "id": msgId
          };
        }
        else if (data.data.type === "GROUP_SENDING_IMG"){
          let dat = data.data;
          msgId = 1; 
          param = {
            "toUser":{"id":+dat.fromUserId, 
                      "nickName":this.newGroupFriend[+dat.fromUserId].friendName, 
                      },
            "message":dat.content,
            "id": msgId
          };
        } else {
          return;
        }
        //添加到信息列表，以便展示信息
        if (! this.messageList){
          this.messageList = [param];
        }
        else{
          this.messageList.push( param );
        }
        this.currendStartChatList.push(data.data)
        this.websockOnMessage()
      })
    },
    handleFile(event){
      this.ff=1;
      let data = event.target.files[0];

      let toId = this.$route.params.groupId;  //???
      if((/.jpg|.jpeg|.png|.img/ig.test(data.name))&&data.size < 65530){
        let me = this;
        // //方式一：内存url   eg:blob:http://localhost:8080/b077141c-9d62-487b-9e3a-c8b93058aa10
        // me.imageFile = URL.createObjectURL(data);
        // console.log(me.imageFile);
        // me.sendMsg();
        
        //方式二：filereader
        let reader = new FileReader();
        reader.onload = function(e){
          console.log("读取到的图片",e)
          me.imageFile = e.target.result;
          me.sendMsg();
        } 
        reader.readAsDataURL(data);
        //唉到底选哪个啊

      } else if(!data) {
        //没数据，退出
        return;
      } else{
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
          "toGroupId" : ""+this.groupId,
          "content" : ""+this.imageFile,
          "type" : "GROUP_SENDING_IMG",
          "time":""+rq,
        };
        param = {
          "fromUser":{"id":this.$store.getters.userId,
                      "nickName":this.$store.getters.userNickname,
                      },
          "message":this.imageFile,
          "time":rq,
          "id": 1
        };
        this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.groupId])
        .then(res => {
          this.currendStartChatList.push(data);
          this.messageList.push(param);
        });
      }
      else if(this.message !== ""){
        data = {                    
          "fromUserId" : ""+this.userId,
          "toGroupId" : ""+this.groupId,
          "content" : ""+this.message,
          "type" : "GROUP_SENDING",
          "time":""+rq,
        };
        param = {
          "fromUser":{"id":this.$store.getters.userId,
                      "nickName":this.$store.getters.userNickname,
                      },
          "message":this.message,
          "time":rq,
          "id": 0
        };
         this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.groupId])
        .then(res => {
          this.currendStartChatList.push(data);
          this.messageList.push(param);
        });
      }else{
          this.$websocket.dispatch("SendWebsocketFileName", this.File.name)
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
        "toGroupId" : ""+this.groupId,
        "content" : JSON.stringify({
                      "fileName": this.File.name,
                      "fileSize": this.File.size,
                      "fileUrl": fileUrl
                    }),
        "type" : "FILE_MSG_GROUP_SENDING",
        "time":""+rq,
      };
      let param = {
        "fromUser":{"id":this.$store.getters.userId,
                    "nickName":this.$store.getters.userNickname,
                    },

        "message":{
                    "fileName": this.File.name,
                    "fileSize": this.File.size,
                    "fileUrl": fileUrl
                  },

        "id": 2,
        "time":rq,
      };
      this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.groupId]);
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

    ParparePrivateChatMessage(){
      //初始化数据吧

      if (this.currendStartChatList.length <= 0) {
        return ;
      }
      let param = null, msgId = -1;
      this.currendStartChatList.forEach(data => {
        if(data.type === "GROUP_SENDING"){
          msgId = 0;
      console.log("data.fromUserId",data.fromUserId,"this.userId",this.userId,data.content);
          if (""+data.fromUserId === ""+this.userId) {
            param = {
              "fromUser":{"id":""+this.$store.getters.userId,
                          "nickName":""+this.$store.getters.userNickname,
                          },
              "message":data.content,
              "id": msgId,
              "time":data.time,
            };
          }
          else {
            param = {
              "toUser": {"id":+data.fromUserId, 
                          "nickName":this.newGroupFriend[+data.fromUserId].friendName, 
                          },
              "message":data.content,
              "id": msgId,
              "time":data.time,
            };
          }
        } else if (data.type === "GROUP_SENDING_IMG"){
          msgId = 1;
          if (""+data.fromUserId ==="" +this.userId) {
            param = {
              "fromUser":{"id":this.$store.getters.userId,
                          "nickName":this.$store.getters.userNickname,
                          },
              "message":data.content,
              "id": msgId,
              "time":data.time,
            };
          } else {
            param = {
              "toUser": {"id":+data.fromUserId, 
                          "nickName":this.newGroupFriend[+data.fromUserId].friendName, 
                          },
              "message":data.content,
              "id": msgId,
              "time":data.time,
            };
          }
        }else {
          msgId = 2;
          if (""+data.fromUserId ==="" +this.userId) {
          param = {
              "fromUser":{"id":this.$store.getters.userId,
                          "nickName":this.$store.getters.userNickname,
                          },
              "message":JSON.parse(data.content),
              "id": msgId,
              "time":data.time,
            };
          } else {
            param = {
              "toUser": {"id":+data.fromUserId,
                          "nickName":this.newGroupFriend[+data.fromUserId].friendName,
                          },
              "message":JSON.parse(data.content),
              "id": msgId,
              "time":data.time,
            };
           }

        }
        this.messageList.push(param);
      })
    },
    getUnreadList(fromId, toId){
    this.ParparePrivateChatMessage()
    console.log("????",fromId, toId)
      getUnreadGroupMessageList(fromId, toId).then(response =>{
        this.unreadList = response.data.data;
        console.log("有消息未读吗",response)
        if (this.unreadLeaveFriend.length > 0) {
          for (let i = 0; i < this.unreadLeaveFriend.length; i++) {
            if (this.unreadLeaveFriend[i].groupDO !== null && this.unreadLeaveFriend[i].groupDO.id == this.groupId) {
              this.unreadLeaveFriend.splice(i, 1);
              this.$store.state.leaveMessage = this.unreadLeaveFriend;
              break
            }
          }
        }

        if(this.unreadList.length > 0){
          this.unreadList.forEach((data) =>{
            let t = {};
            if (data.type == "0") {
              t.toUser = data.fromUser;
              t.message = data.message;
              t.id = 0;
              t.time=data.time;
            }
            //要是未读信息是图片咋整
            else if (data.type == "1") {
              t.toUser = data.fromUser;
              t.message = data.message;
              t.id = 1;
              t.time=data.time;
            }
            //要是未读消息的文件
            else if(data.type == "2") {
              t.toUser = data.fromUser;
              t.message = JSON.parse(data.message);
              t.id = 2;
              t.time=data.time;
              console.log("文件未读",t)
            }
            if(!this.messageList){
              this.messageList = [t]; 
            }else{
              this.messageList.push(t);
            }
          })
        }

      }).catch(err =>{
      })
    },
  }
}
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

<template>
  <div class="chatPage">
    <!-- 聊天顶部 -->
    <van-nav-bar
      :title= title
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
    <div id="body" >
      <div v-for="(item, ind) in this.messageList" :key="ind" >
        <GroupMyItem v-if="item.fromUser" :messageid="item.id"  me="true" :msg="item.message" :name="item.fromUser.nickName":time="item.time"></GroupMyItem>
        <GroupFriendItem v-else  :messageid="item.id" :msg="item.message" :name="item.toUser.nickName" :time="item.time"></GroupFriendItem>
      </div>
    </div>

    <!-- 聊天底部 -->
    <van-tabbar>
      <van-tabbar-item >
        <input placeholder="输入信息" v-model="message"class="input" />
        <van-button @click="sendMsg" plain type="info" >发送</van-button>
        <div class="bottom" >
          <van-dropdown-menu direction="up">
            <van-dropdown-item ref="item">
              <van-uploader accept="image/gif,image/jpeg,image/jpg,image/png" :before-read="beforeReadImg" :after-read="afterReadImg">
                <van-button type="primary" plain class="file-sending" >图片</van-button>
              </van-uploader >
              <van-uploader accept=".xls,.doc,.txt,.pdf,.gif,.jpeg,.jpg,.png" result-type="file" :before-read="beforeReadFile" :after-read="afterReadFile">
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
import GroupFriendItem from "../groupChatPage/groupFriendItem";
import GroupMyItem from "../groupChatPage/groupMyItem";
import { getMyGroupChatPerson, getUnreadGroupMessageList } from "../../../api/friendOperation";

export default {
  components:{
    GroupFriendItem,
    GroupMyItem
  },
  data() {
    return {
      message: "",
      imageFile: "",
      historyMessageList:[], //历史消息列表
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
      title:this.$route.params.name,
      userId:this.$store.getters.userId,
      myNickName:this.$store.getters.userNickname,
      groupId:"" + this.$route.params.groupId,
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
      console.log("23333");
      this.$websocket.state.groupUnreadNumber[this.groupId] = null;
      this.$websocket.dispatch("StartChatId", [this.groupId, "group"]);
      this.getUnreadList(this.$store.getters.userId, this.groupId);
      this.websockOnMessage();
    },
    //显示结果进度
    showProcess(){
      console.log("showprocess")
      console.log("全部", this.total)
      console.log("当前", this.fileUpload.cuLoaded)
      var percent = (this.fileUpload.cuLoaded / this.total) * 100;
      console.log("####文件传输百分比", percent)
      // document.getElementById('Status').innerText = percent;
    },
    //绑定reader，onmessage里面用
    bindReader() {
      console.log("bindReader")
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
      console.log("loadSuccess")
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
        // const data = JSON.parse(e.data);
        console.log("###########又得开始看返回，生气", e)
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
        data = JSON.parse(e.data);
        // if (data.data.type !== "REGISTER" && data.status === 200 && data.data.toGroupId == this.groupId && !this.newGroupFriend[data.data.fromUserId]) {
        //   this.getGroupFriend(data)
        //   return
        // }
        if(data.data.type !== "REGISTER" && data.status === 200){
          if (data.data.toGroupId == this.groupId){
            console.log("喵dd2.0",data.data);
            let msgId = -1;
            if(data.data.type === "GROUP_SENDING"){
              let dat = data.data;
              msgId = 0;
              param = {
                "toUser":{"id":+dat.fromUserId,
                          "nickName":this.newGroupFriend[+dat.fromUserId].friendName,
                          },
                "message":dat.content,
                "id": msgId,
                "time":data.time,
              };
            } else if (data.data.type === "GROUP_SENDING_IMG"){
              let dat = data.data;
              msgId = 1;
              param = {
                "toUser":{"id":+dat.fromUserId,
                  "nickName":this.newGroupFriend[+dat.fromUserId].friendName,
                },
                "message":dat.content,
                "id": msgId,
                "time":data.time,
              };
            } else {
              // return;
              let dat = data.data;
              msgId = 2;
              param = {
                // "fromUser":{"id":this.$route.params.friendId,
                //   "nickName": this.$route.params.name,
                // },
                // "toUser":{"id":this.$store.getters.userId,
                //   "nickName":this.$store.getters.userNickname,
                // },
                "toUser":{"id":+dat.fromUserId,
                  "nickName":this.newGroupFriend[+dat.fromUserId].friendName,
                },
                "message":JSON.parse(dat.content),
                "id": msgId,
                "time":data.time,
              };
            }
            //添加到信息列表，以便展示信息
            if (! this.messageList){
              this.messageList = [param];
            } else {
              this.messageList.push( param );
            }
            this.currendStartChatList.push(data.data)
          } else {
            let re = /SINGLE/;
            if (re.test(data.data.type) === true) {
              this.$toast({
                message:"新的好友信息，请注意查看",
                position:"top"
              });
              if(this.$websocket.state.privateMessage.find( (val, ind) => ind == data.data.fromUserId ) != null || this.$websocket.state.privateMessage.find( (val, ind) => ind == data.data.fromUserId ) != undefined){
                this.$websocket.state.privateMessage[data.data.fromUserId].push(data.data);
                this.$websocket.state.privateUnreadNumber[data.data.fromUserId] = (+this.$websocket.state.privateUnreadNumber[data.data.fromUserId]) + 1;
              } else {
                this.$websocket.state.privateMessage[data.data.fromUserId] = [data.data];
                this.$websocket.state.privateUnreadNumber[data.data.fromUserId] = +1;
              }
            } else {
              this.$toast({
                message:"新的群信息，请注意查看",
                position:"top"
              });
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
        console.log("获取群聊好友")
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
    sendMsg(){
      console.log("发送msgr")
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
        this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.friendId])
          .then(res => {
            this.currendStartChatList.push(data);
            this.messageList.push(param);
          });
      }
      if(this.message !== ""){
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
        this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.friendId])
          .then(res => {
            this.currendStartChatList.push(data);
            this.messageList.push(param);
          });
      }
      else{
        this.$websocket.dispatch("SendWebsocketFileName", this.File.name);
      }
      // this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.groupId]);
      // this.currendStartChatList.push(data);
      // this.messageList.push(param);
      this.message = "";
      this.imageFile = "";
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
          if (+data.fromUserId === +this.userId) {
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
        } else if (data.type === "GROUP_SENDING_IMG"){
          //先留下口子
          msgId = 1;
          if (+data.fromUserId === +this.userId) {
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
        }
        else {
          msgId = 2;
          if (+data.fromUserId === +this.userId) {
            param = {
              "fromUser": {
                "id": this.$store.getters.userId,
                "nickName": this.$store.getters.userNickname,
              },
              "message": JSON.parse(data.content),
              "id": msgId,
              "time":data.time,
            };
          } else {
            param = {
              "toUser": {
                "id": +data.fromUserId,
                "nickName": this.newGroupFriend[+data.fromUserId].friendName,
              },
              "message": JSON.parse(data.content),
              "id": msgId,
              "time":data.time,
            };
          }
        }
        this.messageList.push(param);
      })
    },
    getUnreadList(fromId, toId){
      this.ParparePrivateChatMessage();
      getUnreadGroupMessageList(fromId, toId).then(response =>{
        this.unreadList = response.data.data;
        if (this.unreadLeaveFriend.length > 0) {
          for (let i = 0; i < this.unreadLeaveFriend.length; i++) {
            if (this.unreadLeaveFriend[i].groupDO !== null && this.unreadLeaveFriend[i].groupDO.id == this.groupId) {
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
              //只能先留口子
              t.toUser = data.fromUser;
              t.message = data.message;
              t.id = 2;
              t.time=data.time;
              // t.time=data.time;
              console.log("文件未读",t)
            }
            if(!this.messageList){
              this.messageList = [t];
            }else{
              this.messageList.push(t);
            }
          })
        }

      }).catch()
    },
    onClickLeft(){
      this.$router.back()
    },
    beforeReadImg(){
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
    beforeReadFile(){
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


  }
}
</script>

<style lang="scss" scoped >
#body{
  margin:0.1rem 0.1rem 0rem 0.1rem;
  width:98%;
  height: 84.5%;
  background-color:rgb(250, 250, 250);
  margin-bottom: 1.5rem;
  overflow:auto;
}
.chatPage{
  height: 100%
}
 .file-sending{
   padding-left:4.5rem;padding-right:4.5rem
 }
  .input{
    background-color: rgb(250, 250, 250); line-height:180%; font-size:0.5rem
  }
  .bottom{
    width:0.5rem; float:right
  }
</style>

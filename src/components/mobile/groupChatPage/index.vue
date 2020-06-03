<template>
  <div class="chatPage" style="height: 100%">
    <!-- 聊天顶部 -->
    <van-nav-bar
      :title= title
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />

    <!-- 聊天内容主体 -->
    <div id="body" >
      <div v-for="(item, ind) in this.messageList" :key="ind" >
        <GroupMyItem v-if="item.fromUser" :messageid="item.id"  me="true" :msg="item.message" :name="item.fromUser.nickName"></GroupMyItem>
        <GroupFriendItem v-else  :messageid="item.id" :msg="item.message" :name="item.toUser.nickName"></GroupFriendItem>
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
      title:this.$route.params.name,
      message: "",
      imageFile: "",
      // websock: null,
      historyMessageList:[],    //历史消息列表
      unreadList:[],    //未读消息列表
      userId:this.$store.getters.userId,
      messageList:[],
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
    onClickLeft(){
      this.$router.back()
    },
    beforeReadImg(){
      return true;
    },
    afterReadImg(file, detail){
      // console.log(file, detail);
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
    afterReadFile(){},
    onConfirm(){
      this.$refs.item.toggle();
    },
    init(){
      this.$websocket.state.groupUnreadNumber[this.groupId] = null;
      this.$websocket.dispatch("StartChatId", [this.groupId, "group"]);
      this.getUnreadList(this.$store.getters.userId, this.groupId);
      this.websockOnMessage();
    },
    getGroupFriend(data){
      getMyGroupChatPerson(this.$route.params.groupId).then((res) => {
        let oldGroupFriend = res.data.data
        for (let i = 0; i < oldGroupFriend.length; i++) {
          let tmp = {
            friendId: oldGroupFriend[i].user.id,
            friendName: oldGroupFriend[i].user.nickName,
            // friendAvatar: oldGroupFriend[i].user.avatar
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
                      // "avatar": this.newGroupFriend[+dat.fromUserId].friendAvatar
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
                      // "avatar": this.newGroupFriend[+dat.fromUserId].friendAvatar
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
      let data = null;
      let param = null;
      if (this.message.trim() === "" && this.imageFile.trim() === ""){
        this.$message.error("输入信息不能为空");
        return
      }
      if(this.imageFile !== ""){
        data = {
          "fromUserId" : ""+this.userId,
          "toGroupId" : ""+this.groupId,
          "content" : ""+this.imageFile,
          "type" : "GROUP_SENDING_IMG"
        };
        param = {
          // "user":1,
          "fromUser":{"id":this.$store.getters.userId,
                      "nickName":this.$store.getters.userNickname,
                      // "avatar":this.$store.getters.userAvatar
          },
          "message":this.imageFile,
          "id": 1
        };
      }
      if(this.message !== ""){
        data = {
          "fromUserId" : ""+this.userId,
          "toGroupId" : ""+this.groupId,
          "content" : ""+this.message,
          "type" : "GROUP_SENDING"
        };
        param = {
          // "user":1,
          "fromUser":{"id":this.$store.getters.userId,
                      "nickName":this.$store.getters.userNickname,
                      // "avatar":this.$store.getters.userAvatar
          },
          "message":this.message,
          "id": 0
        };
      }
      // console.log("应该发东西", data)
      this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.groupId]);
      this.currendStartChatList.push(data);
      // console.log(this.currendStartChatList)
      this.messageList.push(param);
      this.message = "";
      this.imageFile = "";
      this.websockOnMessage();
    },
    websockOnMessage(){
      let param = null;
      this.$websocket.state.websock.onmessage = e =>{
        const data = JSON.parse(e.data);
        console.log("这是在群聊里面得到的数据啊", data);
        // console.log("this.newGroupFriend", this.newGroupFriend)
        if (data.data.type !== "REGISTER" && data.status === 200 && data.data.toGroupId == this.groupId && !this.newGroupFriend[data.data.fromUserId]) {
          this.getGroupFriend(data)
          return
        }
        if(data.data.type !== "REGISTER" && data.status === 200){
          if (data.data.toGroupId == this.groupId){
            let msgId = -1;
            if(data.data.type === "GROUP_SENDING"){
              let dat = data.data;
              // console.log("在接受信息里面", this.newGroupFriend)
              msgId = 0;
              param = {
                "toUser":{"id":+dat.fromUserId,
                          "nickName":this.newGroupFriend[+dat.fromUserId].friendName,
                          // "avatar": this.newGroupFriend[+dat.fromUserId].friendAvatar
                },
                "message":dat.content,
                "id": msgId
              };
            }
            else if (data.data.type === "GROUP_SENDING_IMG"){
              let dat = data.data;
              // console.log("在接受信息里面", this.newGroupFriend)
              msgId = 1;
              param = {
                "toUser":{"id":+dat.fromUserId,
                          "nickName":this.newGroupFriend[+dat.fromUserId].friendName,
                          // "avatar": this.newGroupFriend[+dat.fromUserId].friendAvatar
                },
                "message":dat.content,
                "id": msgId
              };
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
            let re = /SINGLE/;
            if (re.test(data.data.type) === true) {
              this.$toast({
                message:"新的好友信息，请注意查看",
                position:"top"
              });
              // console.log("走这儿吗",this.$websocket.state.privateMessage.find( (val, ind) => ind == data.data.fromUserId ))
              if(this.$websocket.state.privateMessage.find( (val, ind) => ind == data.data.fromUserId ) != null || this.$websocket.state.privateMessage.find( (val, ind) => ind == data.data.fromUserId ) != undefined){
                this.$websocket.state.privateMessage[data.data.fromUserId].push(data.data);
                this.$websocket.state.privateUnreadNumber[data.data.fromUserId] = (+this.$websocket.state.privateUnreadNumber[data.data.fromUserId]) + 1;
              } else{
                this.$websocket.state.privateMessage[data.data.fromUserId] = [data.data];
                this.$websocket.state.privateUnreadNumber[data.data.fromUserId] = +1;
              }
              console.log(this.$websocket.state.privateUnreadNumber, this.$websocket.state.privateUnreadNumber.length)
              console.log(this.$websocket.state.privateMessage)              
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
              console.log(this.$websocket.state.groupUnreadNumber)
              console.log(this.$websocket.state.groupMessage) 
            }
            // this.$toast({
            //   message:"新的群聊，请注意查看",
            //   position:"top"
            // });
            // // console.log("外人发来信息展示之前", this.$websocket.state.privateMessage)
            // if(this.$websocket.state.groupMessage.some((val, ind) => {return (""+ind) === data.data.toGroupId })){
            //   this.$websocket.state.groupMessage[data.data.toGroupId].push(data.data);
            //   this.$websocket.state.groupUnreadNumber[data.data.toGroupId] = this.$websocket.state.groupUnreadNumber[data.data.toGroupId] + 1;
            // } else{
            //   this.$websocket.state.groupMessage[data.data.toGroupId] = [data.data];
            //   this.$websocket.state.groupUnreadNumber[data.data.toGroupId] = 1;
            // }
          }
        }
      }
    },
    ParparePrivateChatMessage(){
      //初始化数据吧
      if (this.currendStartChatList.length <= 0) {
        return ;
      }
      let param = null, msgId = -1;
      console.log("currendStartChatList", this.currendStartChatList)
      this.currendStartChatList.forEach(data => {
        if(data.type === "GROUP_SENDING"){
          msgId = 0;
          if (+data.fromUserId === +this.userId) {
            param = {
              "fromUser":{"id":this.$store.getters.userId,
                          "nickName":this.$store.getters.userNickname,
                          // "avatar":this.$store.getters.userAvatar
              },
              "message":data.content,
              "id": msgId
            };
          }
          else {
            // console.log( this.newGroupFriend, this.newGroupFriend[+data.fromUserId] , data.fromUserId)
            param = {
              "toUser": {"id":+data.fromUserId,
                          "nickName":this.newGroupFriend[+data.fromUserId].friendName,
                          // "avatar": this.newGroupFriend[+data.fromUserId].friendAvatar
              },
              "message":data.content,
              "id": msgId
            };
          }
        }
        else if (data.type === "GROUP_SENDING_IMG"){
          //先留下口子
          msgId = 1;
          if (+data.fromUserId === +this.userId) {
            param = {
              "fromUser":{"id":this.$store.getters.userId,
                          "nickName":this.$store.getters.userNickname,
                          // "avatar":this.$store.getters.userAvatar
              },
              "message":data.content,
              "id": msgId
            };
          }
          else {
            param = {
              "toUser": {"id":+data.fromUserId,
                          "nickName":this.newGroupFriend[+data.fromUserId].friendName,
                          // "avatar": this.newGroupFriend[+data.fromUserId].friendAvatar
              },
              "message":data.content,
              "id": msgId
            };
          }
        }
        this.messageList.push(param);
      })
    },
    getUnreadList(fromId, toId){
      getUnreadGroupMessageList(fromId, toId).then(response =>{
        this.unreadList = response.data.data;
        console.log("getUnreadList接受到的具体未读信息", this.unreadList);
        if (this.unreadLeaveFriend.length > 0) {
          // console.log("zouzhermammmmmm")
          for (let i = 0; i < this.unreadLeaveFriend.length; i++) {
            if (this.unreadLeaveFriend[i].groupDO !== null && this.unreadLeaveFriend[i].groupDO.id == this.groupId) {
              this.unreadLeaveFriend.splice(i, 1);
              this.$store.state.leaveMessage = this.unreadLeaveFriend;
              console.log("未读消息能消去吗", this.unreadLeaveFriend, this.$store.state.leaveMessage)
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
            }
            //要是未读信息是图片咋整
            else if (data.type == "1") {
              t.toUser = data.fromUser;
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
  }
}
</script>

<style scoped>
#body{
  margin:0.1rem 0.1rem 0rem 0.1rem;
  width:98%;
  height: 84.5%;
  background-color:rgb(250, 250, 250);
  margin-bottom: 1.5rem;
  overflow:auto;
}
</style>

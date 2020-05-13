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
    <div id="body">
      <div v-for="(item, ind) in this.messageList" :key="ind">
        <GroupMyItem v-if="item.fromUser" :messageid="item.id" :img="item.fromUser.avatar" me="true" :msg="item.message" :name="item.fromUser.nickName"></GroupMyItem>
        <GroupFriendItem v-else :img="item.toUser.avatar" :messageid="item.id" :msg="item.message" :name="item.toUser.nickName"></GroupFriendItem>
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
    afterReadImg(){},
    beforeReadFile(){
      return true;
    },
    afterReadFile(){},
    onConfirm(){
      this.$refs.item.toggle();
    },
    init(){
      // this.$websocket.state.groupUnreadNumber[this.groupId] = undefined;
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
            friendAvatar: oldGroupFriend[i].user.avatar
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
                      "avatar": this.newGroupFriend[+dat.fromUserId].friendAvatar}, 
            "message":dat.content,
            "id": msgId
          };
        }
        else if (data.data.type === "GROUP_SENDING_IMG"){
          //先留下口子
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
          "toUserId" : ""+this.friendId,
          "content" : ""+this.imageFile,
          "type" : "SINGLE_SENDING_IMG"
        };
        param = {
          // "user":1,
          "fromUser":{"id":this.$store.getters.userId,
                      "nickName":this.$store.getters.userNickname,
                      "avatar":this.$store.getters.userAvatar}, 
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
                      "avatar":this.$store.getters.userAvatar}, 
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
                          "avatar": this.newGroupFriend[+dat.fromUserId].friendAvatar}, 
                "message":dat.content,
                "id": msgId
              };
            }
            else if (data.data.type === "GROUP_SENDING_IMG"){
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
            this.$message("新的群聊，请注意查看");
            // console.log("外人发来信息展示之前", this.$websocket.state.privateMessage)
            if(this.$websocket.state.groupMessage.some((val, ind) => {return (""+ind) === data.data.toGroupId })){
              this.$websocket.state.groupMessage[data.data.toGroupId].push(data.data);
            } else{
              this.$websocket.state.groupMessage[data.data.toGroupId] = [data.data];
            }
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
      // console.log("查看全局保持的信息")
      this.currendStartChatList.forEach(data => {
        if(data.type === "GROUP_SENDING"){
          msgId = 0;
          if (+data.fromUserId === +this.userId) {
            param = {
              "fromUser":{"id":this.$store.getters.userId,
                          "nickName":this.$store.getters.userNickname,
                          "avatar":this.$store.getters.userAvatar},  
              "message":data.content,
              "id": msgId
            };
          }
          else {
            // console.log( this.newGroupFriend, this.newGroupFriend[+data.fromUserId] , data.fromUserId)
            param = {
              "toUser": {"id":+data.fromUserId, 
                          "nickName":this.newGroupFriend[+data.fromUserId].friendName, 
                          "avatar": this.newGroupFriend[+data.fromUserId].friendAvatar}, 
              "message":data.content,
              "id": msgId
            };
          }
        }
        else if (data.type === "GROUP_SENDING_IMG"){
          //先留下口子
          msgId = 1;
        }
        this.messageList.push(param);
      })
    },
    getUnreadList(fromId, toId){
      getUnreadGroupMessageList(fromId, toId).then(response =>{
        this.unreadList = response.data.data;
        console.log("getUnreadList接受到的具体未读信息", this.unreadList);
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

<style>

</style>
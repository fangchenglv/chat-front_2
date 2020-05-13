<template>
    <el-container>

    <el-header style="height:auto">
      <p style="font-size:0.7rem;margin:0 0 auto;">{{$route.params.name}}</p>
    </el-header>

    <el-main style="margin:0 0.1rem 1.2rem 0.1rem;width:98%;padding-top:0.1rem">
      <div v-for="(item, ind) in this.messageList" :key="ind">
          <GroupFriendItem v-if="item.toUser" :messageid="item.id" :img="item.toUser.avatar" :msg="item.message" :name="item.toUser.nickName"></GroupFriendItem>
          <GroupMyItem v-else :img="item.fromUser.avatar" :messageid="item.id" :msg="item.message" :name="item.fromUser.nickName" me="true"></GroupMyItem>
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
    // console.log("newGroupFriend", this.newGroupFriend);
    this.init();
  },
  beforeDestroy(){
    this.$websocket.state.groupMessage[this.groupId] = this.currendStartChatList;
    this.$websocket.dispatch("StopChatId");
  },
  methods:{
    init(){
      // console.log("到底渲染了几次")
      this.$websocket.dispatch("StartChatId", [this.groupId, "group"]);
      this.getUnreadList(this.$store.getters.userId, this.groupId);
      this.websockOnMessage();
    },
    getGroupFriend(data){
      // console.log("到底渲染了几次", this.newGroupFriend, )
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
      // console.log("currendStartChatList", this.currendStartChatList)
      // console.log("到底渲染了几次", this.currendStartChatList)
      
      this.currendStartChatList.forEach(data => {
        // console.log("newGroupFriend", this.newGroupFriend)
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
            param = {
              "toUser": {"id":+data.fromUserId, 
                          "nickName":this.newGroupFriend[+data.fromUserId].friendName, 
                          "avatar": this.newGroupFriend[+data.fromUserId].friendAvatar}, 
              "message":data.content,
              "id": msgId
            };
          }
        }
        else if (data.type === "SINGLE_SENDING_IMG"){
          //先留下口子
          msgId = 1;
        }
        this.messageList.push(param);
        console.log(this.messageList)
      })
    },
    getUnreadList(fromId, toId){
      // console.log("到底渲染了几次")
      getUnreadGroupMessageList(fromId, toId).then(response =>{
        this.unreadList = response.data.data;
        // console.log("getUnreadList接受到的具体未读信息", this.unreadList, fromId, toId);
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
      }).catch(err =>{
        // console.log("!!!!!!!!!!!!", err)
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
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
            <input type="file" accept=".xls,.doc,.txt,.pdf" name="file" id="file" class="inputfile" @change="handleFile($event)" />
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
      let data = event.target.files[0];
      if (data.size > 65530) {
        this.$message("图片太大，请转换为文件上传")
        return
      }
      let toId = this.$route.params.friendId;
      if(/.jpg|.jpeg|.png|.img/ig.test(data.name)){
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
          "toGroupId" : ""+this.groupId,
          "content" : ""+this.imageFile,
          "type" : "GROUP_SENDING_IMG"
        };
        param = {
          "fromUser":{"id":this.$store.getters.userId,
                      "nickName":this.$store.getters.userNickname,
                      },
          "message":this.imageFile,
          "id": 1
        };
      }
      else if(this.message !== ""){
        data = {                    
          "fromUserId" : ""+this.userId,
          "toGroupId" : ""+this.groupId,
          "content" : ""+this.message,
          "type" : "GROUP_SENDING"
        };
        param = {
          "fromUser":{"id":this.$store.getters.userId,
                      "nickName":this.$store.getters.userNickname,
                      },
          "message":this.message,
          "id": 0
        };
      }
      this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.groupId]);
      this.currendStartChatList.push(data);
      this.messageList.push(param);
      this.message = "";
      this.imageFile = "";
      this.websockOnMessage();
    },
    websockOnMessage(){
      let param = null;
      this.$websocket.state.websock.onmessage = e =>{
        const data = JSON.parse(e.data);
        if (!this.newGroupFriend[data.data.fromUserId] && data.data.type !== "REGISTER") {
          this.getGroupFriend(data)
          return
        }
        if(data.data.type !== "REGISTER" && data.status === 200){
          if (data.data.toGroupId == this.groupId){
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
            } else {return;}
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
              "id": msgId
            };
          }
          else {
            param = {
              "toUser": {"id":+data.fromUserId, 
                          "nickName":this.newGroupFriend[+data.fromUserId].friendName, 
                          },
              "message":data.content,
              "id": msgId
            };
          }
        } else if (data.type === "GROUP_SENDING_IMG"){
          msgId = 1;
          if (+data.fromUserId === +this.userId) {
            param = {
              "fromUser":{"id":this.$store.getters.userId,
                          "nickName":this.$store.getters.userNickname,
                          },
              "message":data.content,
              "id": msgId
            };
          } else {
            param = {
              "toUser": {"id":+data.fromUserId, 
                          "nickName":this.newGroupFriend[+data.fromUserId].friendName, 
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

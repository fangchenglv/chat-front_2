<template>
  <div lang="scss">
    <el-row>
      <el-col :span="11" v-for="(item,ind) in this.unreadFriendGroup" :key="ind" :offset="1">
        <el-card>
           <el-avatar shape="circle":size="70"> {{item.nickName}} </el-avatar>
          <p style="font-size:0.5rem; ">昵称:{{item.nickName}}</p>
          <p style="font-size:0.4rem;float:right">未读信息数:{{item.count}}</p>

          <div  v-if="item.status" class="loc">
            <span v-if="item.status == 1"><i class="el-icon-view"/>用户上线</span>
            <span v-else><i class="el-icon-view"/>用户离线</span>
          </div>

          <div class="button">
            <el-button
              plain
              type="primary"
              @click="toChatroom(item.id, item.nickName, item.avatar, item.groupNum)"
            >聊天</el-button>
            <el-button 
              plain
              type="info"
              @click="toHistoryPage(item.id)"
            >历史记录</el-button> 
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>

export default {
  name: 'homePage',
  data(){
    return{
      unreadFriendGroup:[],
      unreadLeaveFriend:this.$store.getters.leaveMessage,
      privateUnreadNumber: this.$websocket.state.privateUnreadNumber,
      groupUnreadNumber: this.$websocket.state.groupUnreadNumber,
      allFriend: {},
      allGroup:{},
    }
  },
  mounted(){
    this.init()
  },
  methods:{
    init(){

      this.unreadLeaveFriend=this.$store.getters.leaveMessage;
      this.unreadLeaveFriend=this.$store.getters.leaveMessage;
          console.log("进来了嘛",this.unreadLeaveFriend.length);
      this.privateUnreadNumber = this.$websocket.state.privateUnreadNumber;
      this.groupUnreadNumber = this.$websocket.state.groupUnreadNumber;
      console.log("单聊未读数",this.privateUnreadNumber,"群聊未读数",this.groupUnreadNumber);
      this.$store.dispatch("GetMyFriendList", this.$store.getters.userId)
        .then(response => {
          let friend = this.$store.getters.allFriend;
          for (let i = 0; i < friend.length; i++) {
            this.allFriend[friend[i].friendId] = friend[i];
          }
          this.$store.dispatch("GetMyGroupList", this.$store.getters.userId)
        .then(res => {
              let group = this.$store.getters.myGroupChat;
              for (let i = 0; i < group.length; i++) {
                this.allGroup[group[i].id] = group[i];
              }
              this.parpareLeaveData();
        }).catch(err => {
          })
        }).catch(error => {
        });

    },
    parpareLeaveData(){
    console.log("未读朋友",this.unreadLeaveFriend.length);
      if(this.unreadLeaveFriend.length > 0){
        for (let i = 0; i < this.unreadLeaveFriend.length; i++) {
        console.log("未读对象",this.unreadLeaveFriend[i].fromUser);

          if (this.unreadLeaveFriend[i].fromUser == undefined) {
           console.log("没有群对象吗");
            if (this.groupUnreadNumber[this.unreadLeaveFriend[i].groupDO.id] > 0) {
              this.groupUnreadNumber[this.unreadLeaveFriend[i].groupDO.id] = this.unreadLeaveFriend[i].count + this.groupUnreadNumber[this.unreadLeaveFriend[i].groupDO.id];
            } else {
              this.groupUnreadNumber[this.unreadLeaveFriend[i].groupDO.id] = this.unreadLeaveFriend[i].count
            }
          } else {
            if (this.privateUnreadNumber[this.unreadLeaveFriend[i].fromUser.id] > 0) {
              this.privateUnreadNumber[this.unreadLeaveFriend[i].fromUser.id] = this.unreadLeaveFriend[i].count + this.privateUnreadNumber[this.unreadLeaveFriend[i].fromUser.id]
            } else {
              this.privateUnreadNumber[this.unreadLeaveFriend[i].fromUser.id] = this.unreadLeaveFriend[i].count
            }
          }
        }
        this.$store.commit("SET_LEAVEMSG", [])
      }
      this.parpareOnlineData();
    },
    parpareOnlineData(){
      //用户在线时的未读消息展示逻辑
      for (let i = 0; i < this.privateUnreadNumber.length; i++) {
        if (this.privateUnreadNumber[i] > 0) {
          let t = {
            id: i,
            groupNum: null,
            nickName: this.allFriend[i].friendInfo.nickName,
            avatar: this.allFriend[i].friendInfo.avatar,
            count: this.privateUnreadNumber[i],
            status: this.allFriend[i].status
          };
          this.unreadFriendGroup.push(t)
        }
      }
      for (let i = 0; i < this.groupUnreadNumber.length; i++) {
        if (this.groupUnreadNumber[i] > 0) {
          let t = {
            id: this.allGroup[i].id,
            groupNum: this.allGroup[i].groupNum,
            nickName: this.allGroup[i].groupName,
            avatar: this.allGroup[i].avatar,
            count: this.groupUnreadNumber[i],
          };
          this.unreadFriendGroup.push(t)
        }
      }
    },
    toHistoryPage(toId){
      this.$router.push({
        name: "privateHistoryPage",
        params: {fromId: this.$store.getters.userId, toId: toId},
      });
    },
    toChatroom(id, name, pic, groupNum) {
      if (groupNum === null) {
        this.$router.push({
          name: "privateChatRoom",
          params: { friendId: id, name: name, avatar: pic},
        });
      }
      else{
        this.$router.push({
          name: "groupChat",
          params: {groupNum: groupNum}
        })
      }
    },
  }
}
</script>

<style scoped>
.button {
  margin: 0 0 0.3rem 0;
  float: right;
  width: 100%
}
.image{
  width: 20%;
  float: left;
  display: inline-block;
}
.loc{
  float: right;
  margin: 0.3rem 0.6rem 0.3rem 0 ;
  font-size: 0.4rem;
}
</style>

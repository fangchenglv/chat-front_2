<template>
  <div class="head">
    <div v-for="(item, ind) in unreadFriendGroup" :key="ind">
      <van-cell
        :title="item.nickName"
        :value="item.count"
        @click="toPath(item.id, item.groupNum)"
        is-link
        style="background-color:rgb(250,250,250); text-align:left; border:solid 0.02rem #ddd; border-top:none; border-left:none; border-right:none"/>
    </div>
  </div>
</template>

<script>
import {getUnreadMsgList} from '../../../api/friendOperation'

export default {
  name: 'mobileHomePage',
  data(){
    return{
      unreadFriendGroup:[],
      unreadLeaveFriend:this.$store.getters.leaveMessage,
      privateUnreadNumber: this.$websocket.state.privateUnreadNumber,
      groupUnreadNumber: this.$websocket.state.groupUnreadNumber,
      allFriend: {},
      allGroup:{}
    }
  },
  mounted(){
    this.init();
  },
  methods:{
    toPath(id, groupNum){
      if (groupNum === null) {
        this.$router.push({name:"FriendPage", params:{id:id}});
      }
      else{
        this.$router.push({name: "groupChat", params: {groupNum: groupNum}});
      }
    },
    init(){
      this.privateUnreadNumber = this.$websocket.state.privateUnreadNumber;
      this.groupUnreadNumber = this.$websocket.state.groupUnreadNumber;
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
              this.parpareLeaveData()
            }).catch(err => {
            })
        }).catch(error => {
        });
    },
    parpareLeaveData(){
      if(this.unreadLeaveFriend.length > 0){
        for (let i = 0; i < this.unreadLeaveFriend.length; i++) {
          if (this.unreadLeaveFriend[i].fromUser == undefined) {
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
      console.log("d单聊未读信息数量",this.privateUnreadNumber.length, this.privateUnreadNumber);
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
      console.log("群聊未读消息数", this.groupUnreadNumber);
      for (let i = 0; i < this.groupUnreadNumber.length; i++) {
        if (this.groupUnreadNumber[i] > 0) {
          console.log("aaaa",this.allGroup[i])
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
    toHistoryPage(id){
      this.$router.push({
        name: "privateHistoryPage",
        params: {fromId: this.$store.getters.userId, toId: id},
      });
    },
    toChatroom(friendId, name, avatar) {
      this.$router.push({
        name: "privateChatRoom",
        params: { friendId: friendId, name: name, avatar: avatar},
      });
    },
  }
}
</script>

<style scoped>
.head{
  margin-top: 1rem;
  margin-bottom: 1.34rem;
}
</style>

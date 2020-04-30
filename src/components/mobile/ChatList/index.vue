<template>
  <div class="head">
    <div v-for="(item, ind) in unreadFriend" :key="ind">
      <van-cell 
        :icon="item.avatar"
        :title="item.nickName" 
        :value="item.count"
        @click="toFriend(item.id)" 
        is-link 
        style="background-color:rgb(250,250,250);text-align:left;border:solid 0.02rem #ddd; border-top:none; border-left:none; border-right:none"/>
    </div>
  </div>
</template>

<script>
import {getUnreadMsgList} from '../../../api/friendOperation'

export default {
  name: 'mobileHomePage',
  data(){
    return{
      unreadFriend:[],
      unreadGroup:[],
      unreadLeaveFriend:[],
      privateUnreadNumber: this.$websocket.state.privateUnreadNumber,
      groupUnreadNumber: this.$websocket.state.groupUnreadNumber,
      allFriend: {},
      allGroup:{}
    }
  },
  beforeMount(){
    this.init();
  },
  methods:{
    toFriend(friend){
      this.$router.push({name:"FriendPage", params:{id:friend}});
    },
    init(){
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
              getUnreadMsgList(this.$store.getters.userId).then(response =>{
                this.unreadLeaveFriend = response.data.data;
                // console.log("未读信息",this.unreadLeaveFriend);
                this.parpareData();
              }).catch(err => {
                // console.log(error);
              })
            }).catch(err => {
              // console.log(error);
            })
        }).catch(error => {
          // console.log(error);
        });
    },
    parpareData(){
      // console.log("parpareData未读信息",this.unreadLeaveFriend);
      for (let i = 0; i < this.unreadLeaveFriend.length; i++) {
        if (this.privateUnreadNumber[this.unreadLeaveFriend[i].fromUser.id] > 0) {
          let t = {
            id: this.unreadLeaveFriend[i].fromUser.id, 
            nickName: this.unreadLeaveFriend[i].fromUser.nickName, 
            avatar: this.unreadLeaveFriend[i].fromUser.avatar, 
            count: this.unreadLeaveFriend[i].count + this.privateUnreadNumber[this.unreadLeaveFriend[i].fromUser.id],
            status: this.unreadLeaveFriend[i].status
          };
          this.privateUnreadNumber[this.unreadLeaveFriend[i].fromUser.id] = undefined;
          this.unreadFriend.push(t);
        }else{
          let t = {
            id: this.unreadLeaveFriend[i].fromUser.id, 
            nickName: this.unreadLeaveFriend[i].fromUser.nickName, 
            avatar: this.unreadLeaveFriend[i].fromUser.avatar, 
            count: this.unreadLeaveFriend[i].count,
            status: this.unreadLeaveFriend[i].status
          };
          this.unreadFriend.push(t);
        }
      }
      for (let i = 0; i < this.privateUnreadNumber.length; i++) {
        if (this.privateUnreadNumber[i] > 0) {
          let t = {
            id: i, 
            nickName: this.allFriend[i].friendInfo.nickName, 
            avatar: this.allFriend[i].friendInfo.avatar, 
            count: this.privateUnreadNumber[i],
            status: this.allFriend[i].status
          };
          this.unreadFriend.push(t);
        }
      }
      // console.log("整形之后的未读信息列表", this.unreadFriend)
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
  margin-bottom: 1rem;
}
</style>
<template>
  <div class="head">
    <div v-for="(item, ind) in unreadFriendGroup" :key="ind">
      <van-cell

        :title="item.nickName"
        :value="item.count"
        @click="toPath(item.id, item.groupNum)"
        is-link
        style="background-color:rgb(250,250,250);text-align:left;border:solid 0.02rem #ddd; border-top:none; border-left:none; border-right:none"/>

    </div>
    <!-- <div v-for="item in unreadGroup" :key="item.groupNum">
      <van-cell
        :icon="item.avatar"
        :title="item.groupName"
        :value="item.count"
        @click="toPath(item.id, item.groupNum)"
        is-link
        style="background-color:rgb(250,250,250);text-align:left;border:solid 0.02rem #ddd; border-top:none; border-left:none; border-right:none"/>
    </div> -->
  </div>
</template>

<script>
import {getUnreadMsgList} from '../../../api/friendOperation'

export default {
  name: 'mobileHomePage',
  data(){
    return{
      // unreadFriend:[],
      // unreadGroup:[],
      unreadFriendGroup:[],
      unreadLeaveFriend:[],
      privateUnreadNumber: this.$websocket.state.privateUnreadNumber,
      groupUnreadNumber: this.$websocket.state.groupUnreadNumber,
      allFriend: {},
      allGroup:{}
    }
  },
  // beforeMount(){
  //   // this.init();
  //   console.log("activated")
  // },
  mounted(){
    this.init();
    // console.log("mounted")
  },
  activated(){
    // this.init();
    // console.log("activated",this.unreadFriendGroup);
  },
  deactivated(){
    // console.log("deactivated")
  },
  methods:{
    // toFriend(friend){
    //   this.$router.push({name:"FriendPage", params:{id:friend}});
    // },
    toPath(id, groupNum){
      if (groupNum === null) {
        // this.$websocket.state.privateUnreadNumber[id] = undefined;
        this.$router.push({name:"FriendPage", params:{id:id}});
      }
      else{
        // this.$websocket.state.groupUnreadNumber[id] = undefined;
        this.$router.push({name: "groupChat", params: {groupNum: groupNum}});
      }
    },
    init(){
      this.privateUnreadNumber = this.$websocket.state.privateUnreadNumber;
      this.groupUnreadNumber = this.$websocket.state.groupUnreadNumber;
      // console.log(" this.groupUnreadNumber", this.groupUnreadNumber)
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
                console.log("未读信息",this.unreadLeaveFriend);
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
      for (let i = 0; i < this.unreadLeaveFriend.length; i++) {
        // console.log("parpareData未读信息数量", this.unreadLeaveFriendS);
        //用户离线时的未读消息展示逻辑,群聊
        if (this.unreadLeaveFriend[i].fromUser == undefined) {
          if (this.groupUnreadNumber[this.unreadLeaveFriend[i].groupDO.id] > 0) {
            let t = {
              id: this.unreadLeaveFriend[i].groupDO.id,
              groupNum:this.unreadLeaveFriend[i].groupDO.groupNum,
              nickName: this.unreadLeaveFriend[i].groupDO.groupName,
              // avatar: this.unreadLeaveFriend[i].groupDO.avatar,
              count: this.unreadLeaveFriend[i].count + this.groupUnreadNumber[this.unreadLeaveFriend[i].groupDO.id],
              status: this.unreadLeaveFriend[i].status
            };
            this.groupUnreadNumber[this.unreadLeaveFriend[i].groupDO.id] = undefined;
            // this.unreadGroup.push(t);
            this.unreadFriendGroup.push(t)
          }
          else {
            // console.log("parpareData未读消息进来了吗2");
            // console.log(i, "走路3");
            let t = {
              id: this.unreadLeaveFriend[i].groupDO.id,
              groupNum:this.unreadLeaveFriend[i].groupDO.groupNum,
              nickName: this.unreadLeaveFriend[i].groupDO.groupName,
              // avatar: this.unreadLeaveFriend[i].groupDO.avatar,
              count: this.unreadLeaveFriend[i].count,
              status: this.unreadLeaveFriend[i].status
            };
            // this.unreadGroup.push(t);
            this.unreadFriendGroup.push(t)
          }
        }
        //单聊
        else{
          if (this.privateUnreadNumber[this.unreadLeaveFriend[i].fromUser.id] > 0) {
            // console.log(i,"走路1");
            let t = {
              id: this.unreadLeaveFriend[i].fromUser.id,
              groupNum: null,
              nickName: this.unreadLeaveFriend[i].fromUser.nickName,
              // avatar: this.unreadLeaveFriend[i].fromUser.avatar,
              count: this.unreadLeaveFriend[i].count + this.privateUnreadNumber[this.unreadLeaveFriend[i].fromUser.id],
              status: this.unreadLeaveFriend[i].status
            };
            this.privateUnreadNumber[this.unreadLeaveFriend[i].fromUser.id] = undefined;
            // this.unreadFriend.push(t);
            this.unreadFriendGroup.push(t)
          }else{
            // console.log(i,"走路2");
            let t = {
              id: this.unreadLeaveFriend[i].fromUser.id,
              groupNum: null,
              nickName: this.unreadLeaveFriend[i].fromUser.nickName,
              // avatar: this.unreadLeaveFriend[i].fromUser.avatar,
              count: this.unreadLeaveFriend[i].count,
              status: this.unreadLeaveFriend[i].status
            };
            // this.unreadFriend.push(t);
            this.unreadFriendGroup.push(t)
          }
        }
      }
      // //用户在线时的未读消息展示逻辑
      for (let i = 0; i < this.privateUnreadNumber.length; i++) {
        // console.log("d单聊未读信息数量",this.privateUnreadNumber.length);
        if (this.privateUnreadNumber[i] > 0) {
          let t = {
            id: i,
            nickName: this.allFriend[i].friendInfo.nickName,
            // avatar: this.allFriend[i].friendInfo.avatar,
            count: this.privateUnreadNumber[i],
            status: this.allFriend[i].status
          };
          this.unreadFriend.push(t);
        }
      }
      for (let i = 0; i < this.groupUnreadNumber.length; i++) {
        // console.log("d群聊未读信息数量",this.groupUnreadNumber.length);
        if (this.groupUnreadNumber[i] > 0) {
          console.log("aaaa",this.allGroup[i].groupNum)
          let t = {
            id: this.allGroup[i].groupNum,
            groupName: this.allGroup[i].groupName,
            // avatar: this.allGroup[i].avatar,
            count: this.groupUnreadNumber[i],
            status: this.allGroup[i].status
          };
          this.unreadGroup.push(t);
        }
      }
      console.log("整形之后的未读信息列表", this.unreadFriend)
    },
    // parpareData(){
    //   // console.log("parpareData未读信息",this.unreadLeaveFriend);
    //   for (let i = 0; i < this.unreadLeaveFriend.length; i++) {
    //     if (this.privateUnreadNumber[this.unreadLeaveFriend[i].fromUser.id] > 0) {
    //       let t = {
    //         id: this.unreadLeaveFriend[i].fromUser.id,
    //         nickName: this.unreadLeaveFriend[i].fromUser.nickName,
    //         avatar: this.unreadLeaveFriend[i].fromUser.avatar,
    //         count: this.unreadLeaveFriend[i].count + this.privateUnreadNumber[this.unreadLeaveFriend[i].fromUser.id],
    //         status: this.unreadLeaveFriend[i].status
    //       };
    //       this.privateUnreadNumber[this.unreadLeaveFriend[i].fromUser.id] = undefined;
    //       this.unreadFriend.push(t);
    //     }else{
    //       let t = {
    //         id: this.unreadLeaveFriend[i].fromUser.id,
    //         nickName: this.unreadLeaveFriend[i].fromUser.nickName,
    //         avatar: this.unreadLeaveFriend[i].fromUser.avatar,
    //         count: this.unreadLeaveFriend[i].count,
    //         status: this.unreadLeaveFriend[i].status
    //       };
    //       this.unreadFriend.push(t);
    //     }
    //   }
    //   for (let i = 0; i < this.privateUnreadNumber.length; i++) {
    //     if (this.privateUnreadNumber[i] > 0) {
    //       let t = {
    //         id: i,
    //         nickName: this.allFriend[i].friendInfo.nickName,
    //         avatar: this.allFriend[i].friendInfo.avatar,
    //         count: this.privateUnreadNumber[i],
    //         status: this.allFriend[i].status
    //       };
    //       this.unreadFriend.push(t);
    //     }
    //   }
    //   // console.log("整形之后的未读信息列表", this.unreadFriend)
    // },

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

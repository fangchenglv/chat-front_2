<template>
  <div>
    <el-row>
      <el-col :span="11" v-for="(item,ind) in this.unreadFriend" :key="ind" :offset="1">
        <el-card>
          <img :src=item.avatar alt="图片不存在" class="image" />
          <p style="font-size:0.5rem; ">昵称:{{item.nickName}}</p>
          <p style="font-size:0.4rem;float:right">未读信息数:{{item.count}}</p>

          <div class="loc">
            <span v-if="item.status == 1"><i class="el-icon-view"/>用户上线</span>
            <span v-else><i class="el-icon-view"/>用户离线</span>
          </div>

          <div class="button">
            <el-button
              plain
              type="primary"
              @click="toChatroom(item.id, item.nickName, item.avatar)"
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
import {getUnreadMsgList} from '../../../api/friendOperation'

export default {
  name: 'homePage',
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
  mounted(){
    // this.parpareData();
    // console.log("应该有未读信息吧",this.unreadFriend)
  },
  methods:{
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
      // console.log(this.unreadFriend)
    },

    toHistoryPage(toId){
      this.$router.push({
        name: "privateHistoryPage",
        params: {fromId: this.$store.getters.userId, toId: toId},
      });
    },
    toChatroom(id, name, pic) {
      this.$router.push({
        name: "privateChatRoom",
        params: { friendId: id, name: name, avatar: pic},
      });
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
<template>
  <div class="head">
    <div v-for="(item, ind) in unreadFriend" :key="ind">
      <van-card
        :thumb=item.fromUser.avatar
        style="margin-bottom:0.05rem;margin-top:0.05rem;font-size:0.5rem;width:100%"
      >
        <div slot="title">
          <p>用户:{{item.fromUser.userName}}</p>
        </div>
        <div slot="footer">
          <van-button size="small" plain type="primary" @click="toChatroom(item.fromUser.id,item.fromUser.userName,item.fromUser.avatar)">聊天</van-button>
          <van-button size="small" plain type="info" @click="toHistoryPage(item.fromUser.id)">聊天记录</van-button>
        </div>
      </van-card>
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
    }
  },
  mounted(){
    this.init();
  },
  methods:{
    init(){
      getUnreadMsgList(this.$store.getters.userId).then(response =>{
        // console.log("发来信息的人",response);
        this.unreadFriend = response.data.data;
        console.log(this.unreadFriend);
      })
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
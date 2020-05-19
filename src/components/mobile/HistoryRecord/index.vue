<template>
  <div>
    <van-nav-bar
      title="聊天记录"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      id="head"
    />
    <!-- 聊天内容主体 -->
    <div id="body">
      <div v-for="item in this.historyMessageList" :key="item.id">
        <FriendItem v-if="item.fromUser.id == userId" :img="item.fromUser.avatar" me="true" :msg="item.message" :name="item.fromUser.nickName"></FriendItem>
        <MyItem v-else :img="item.fromUser.avatar" :msg="item.message" :name="item.fromUser.nickName"></MyItem>
      </div>
    </div>

  </div>
</template>

<script>
import {getHistoryReadList} from '@/api/friendOperation'
import FriendItem from "../PrivateChatRoom/FriendItem"
import MyItem from "../PrivateChatRoom/MyItem"

export default {
  name: "getHistoryReadList",
  components:{
    FriendItem,
    MyItem
  },
  data(){
    return{
      historyMessageList:[],
      userId: this.$store.getters.userId,
    }
  },
  mounted(){
    this.getHistoryList()
  },
  methods:{
    onClickLeft(){
      this.$router.push({name:"FriendPage", params:{id:this.$route.params.toId}});
    },
    getHistoryList(){
      getHistoryReadList(this.$store.getters.userId, this.$route.params.toId).then(response =>{
        this.historyMessageList = response.data.data;
        console.log("历史信息", this.historyMessageList);
      }).catch();
    },
  }
}
</script>

<style scoped>
#body{
  padding: 0.2rem;
}
</style>
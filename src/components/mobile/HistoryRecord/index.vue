<template>
  <div>
    <van-nav-bar
      title="聊天记录"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      id="head"
    />
  </div>
</template>

<script>
import {getHistoryReadList} from '@/api/friendOperation'

export default {
  name: "getHistoryReadList",
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
</style>
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
      <div v-for="(item, ind) in this.historyMessageList" :key="ind">
        <FriendItem v-if="item.fromUser.id == userId" :messageid="item.id" :img="item.fromUser.avatar" me="true" :msg="item.message" :name="item.fromUser.nickName"></FriendItem>
        <MyItem v-else :messageid="item.id" :img="item.fromUser.avatar" :msg="item.message" :name="item.fromUser.nickName"></MyItem>
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
        getHistoryReadList(this.$route.params.toId, this.userId).then(response =>{
            console.log("哪个是我", this.userId)
            let hist = response.data.data;
            for (let i = 0; i < hist.length; i++) {
                let t = {fromUser:{
                    id: hist[i].fromUserId,
                    avatar: hist[i].fromAvatar,
                    nickName: hist[i].fromName
                    },
                    message: hist[i].content,
                    id:hist[i].type
                }
                this.historyMessageList.push(t)
            }
            // this.historyMessageList = response.data.data;
            console.log("历史信息", this.historyMessageList);
        }).catch();
      }
  }
}
</script>

<style scoped>
#body{
  padding: 0.2rem;
}
</style>
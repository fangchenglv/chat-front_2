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
      <div v-for="(item,ind) in this.historyMessageList" :key="ind">
        <FriendItem v-if="item.fromUser.id == userId" :messageid="item.id"  :msg="item.message" :name="item.fromUser.nickName" me="true" :time="item.time"></FriendItem>
        <MyItem v-else :messageid="item.id"  :msg="item.message" :name="item.fromUser.nickName":time="item.time"></MyItem>
      </div>
    </div>

  </div>
</template>

<script>
import {getSingleHistoryReadList} from '@/api/friendOperation'
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
      getSingleHistoryReadList(this.$store.getters.userId, this.$route.params.toId).then(response =>{
        let hist = response.data.data;
        for (let i = 0; i < hist.length; i++) {
          console.log("有时间吗",hist[i]);
          if( hist[i].type==2){
            console.log("自己的文件",JSON.parse(hist[i].content));
            let t = {fromUser:{
                id: hist[i].fromUserId,
                // avatar: hist[i].fromAvatar,
                nickName: hist[i].fromName
              },
              message: JSON.parse(hist[i].content),
              id:hist[i].type,
              time:hist[i].sendTime,
            }
            this.historyMessageList.push(t)
          }else{
            let t = {fromUser:{
                id: hist[i].fromUserId,
                nickName: hist[i].fromName
              },
              message: hist[i].content,
              id:hist[i].type,
              time:hist[i].sendTime,
            }
            this.historyMessageList.push(t)
          }
          }

        }).catch((error) => {
          console.log("1111",error);
        });
      }
    },

}
</script>

<style lang="scss" scoped>
#body{
  padding: 0.2rem;
  margin-top: 1.1rem;
}
</style>

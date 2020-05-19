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
        <GroupFriendItem v-if="item.toUser" :img="item.toUser.avatar" :messageid="item.id" :msg="item.message" :name="item.toUser.nickName"></GroupFriendItem>
      </div>
    </div>

  </div>
</template>

<script>
import {getGroupHistoryReadList} from '@/api/friendOperation'
import GroupFriendItem from "../../groupChatPage/groupFriendItem";

export default {
    name: "getGroupHistoryReadList",
    components:{
        GroupFriendItem,
        // GroupMyItem
    },
    data(){
        return{
            historyMessageList:[],
            groupId: this.$route.params.id,
        }
    },

    mounted(){
        this.getHistoryList()
    },

    methods:{
      onClickLeft(){
        this.$router.back();
      },
      getHistoryList(){
        getGroupHistoryReadList(this.groupId).then(response =>{
            console.log("返回的历史列表", response)
            let hist = response.data.data;
            for (let i = 0; i < hist.length; i++) {
                let t = {toUser:{
                    id: hist[i].userId,
                    avatar: hist[i].fromAvatar,
                    nickName: hist[i].fromName
                    },
                    message: hist[i].content,
                    id:hist[i].type
                }
                this.historyMessageList.push(t)
            }
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
<template>
    <el-container>
        <el-main >
            <!-- <ul>
                <li v-for="item in this.historyMessageList" :key="item.time">
                    <ChatItem v-if="item.fromUser.id == userId" :img="item.fromUser.avatar" me="true" :msg="item.message" :name="item.fromUser.nickName" :time="item.time" :href=" null "></ChatItem>
                    <ChatItem v-else :href=" null " :img="item.fromUser.avatar" :msg="item.message" :name="item.fromUser.nickName" :time="item.time"></ChatItem>
                </li>
            </ul> -->
        </el-main>
    </el-container>
</template>

<script>
import {getHistoryReadList} from '@/api/friendOperation'
// import ChatItem from '@/components/privateChatroom/ChatItem'

export default {
    name: "getHistoryReadList",
    components:{
        // ChatItem,
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
/* @import "./chat.scss";
.el-main{
    padding: 10px;
} */
</style>
<template>
    <el-container>
        <el-main style="background-color:rgb(255,255,255)">
            <div v-for="(item, ind) in historyMessageList" :key="ind">
                <FriendItem v-if="item.fromUser.id == userId" :img="item.fromUser.avatar" me="true" :msg="item.message" :name="item.fromUser.nickName"></FriendItem>
                <MyItem v-else :img="item.fromUser.avatar" :msg="item.message" :name="item.fromUser.nickName"></MyItem>
            </div>
        </el-main>
    </el-container>
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
      getHistoryList(){
        getHistoryReadList(this.$store.getters.userId, this.$route.params.toId).then(response =>{
            this.historyMessageList = response.data.data;
            // console.log("历史信息", this.historyMessageList);
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
<template>
    <el-container lang="scss">
        <el-main style="background-color:rgb(255,255,255)">
            <div v-for="(item, ind) in historyMessageList" :key="ind">
                 <FriendItem v-if="item.fromUser.id == userId" :messageid="item.id" :img="item.fromUser.avatar" me="true" :msg="item.message" :name="item.fromUser.nickName"></FriendItem>
                 <MyItem v-else :messageid="item.id" :img="item.fromUser.avatar" :msg="item.message" :name="item.fromUser.nickName"></MyItem>
            </div>
        </el-main>
    </el-container>
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
      getHistoryList(){
        getSingleHistoryReadList(this.$route.params.toId, this.userId).then(response =>{
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
        }).catch();
      },
    }
}
</script>



<template>
    <el-container lang="scss">
        <el-main style="background-color:rgb(255,255,255)">
            <div v-for="(item, ind) in historyMessageList" :key="ind">
              <GroupFriendItem v-if="item.toUser" :messageid="item.id" :img="item.toUser.avatar" :msg="item.message" :name="item.toUser.nickName":time="item.time"></GroupFriendItem>
            </div>
        </el-main>
    </el-container>
</template>

<script>
import {getGroupHistoryReadList} from '@/api/friendOperation'
import GroupFriendItem from "../../groupChatPage/groupFriendItem";
import GroupMyItem from "../../groupChatPage/groupMyItem";

export default {
    name: "getGroupHistoryReadList",
    components:{
        GroupFriendItem,
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
      getHistoryList(){
        getGroupHistoryReadList(this.groupId).then(response =>{
            let hist = response.data.data;
            for (let i = 0; i < hist.length; i++) {
            console.log("有时间吗",hist[i],this.userId);
            if( hist[i].type==2){

                let t = {toUser:{
                    id: hist[i].userId,

                    nickName: hist[i].fromName
                    },
                    message: JSON.parse(hist[i].content),
                    id:hist[i].type,
                    time:hist[i].sendTime,
                }
                this.historyMessageList.push(t)
            }else{
                let t = {toUser:{
                    id: hist[i].userId,

                    nickName: hist[i].fromName
                    },
                    message: hist[i].content,
                    id:hist[i].type,
                    time:hist[i].sendTime,
                }
                this.historyMessageList.push(t)
            }

            }
        }).catch();
      },
    }
}
</script>

<style scoped>
</style>

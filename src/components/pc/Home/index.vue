<template>
  <div>
    <el-row>
      <el-col :span="11" v-for="item in this.unreadFriend" :key="item.friendId" :offset="1">
        <el-card >
          <img :src=item.fromUser.avatar alt="图片不存在" class="image" />
            <p style="font-size:0.5rem; ">昵称:{{item.fromUser.nickName}}</p>

            <div class="loc">
              <span v-if="item.status == 1"><i class="el-icon-view"/>用户上线</span>
              <span v-else><i class="el-icon-view"/>用户离线</span>
            </div>

            <div class="button">
              <el-button
                plain
                type="primary"
                @click="toChatroom(item.fromUser.id, item.fromUser.nickName, item.fromUser.avatar)"
              >聊天</el-button>
              <!-- <el-button 
                plain
                type="warning"
                @click="deleteFriend(item.friendId)"
              >删除好友</el-button> -->
              <el-button 
                plain
                type="info"
                @click="toHistoryPage(item.fromUser.id)"
              >历史记录</el-button> 
            </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import {getUnreadMsgList} from '../../../api/friendOperation'

export default {
  name: 'homePage',
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
      this.$store
        .dispatch("GetMyFriendList", this.$store.getters.userId)
        .then(response => {})
        .catch(error => {
          console.log(error);
        });
      getUnreadMsgList(this.$store.getters.userId).then(response =>{
        // console.log("发来信息的人",response);
        this.unreadFriend = response.data.data;
        // console.log(this.unreadFriend);
      })
    },
    toHistoryPage(toId){
      this.$router.push({
        name: "privateHistoryPage",
        params: {fromId: this.$store.getters.userId, toId: toId},
      });
    },
    toChatroom(id, name, pic) {
      this.$router.push({
        name: "privateChatRoom",
        params: { friendId: id, name: name, avatar: pic},
      });
    },
  }
}
</script>

<style scoped>
.button {
  margin: 0 0 0.3rem 0;
  float: right;
  width: 100%
}
.image{
  width: 20%;
  float: left;
  display: inline-block;
}
.loc{
  float: right;
  margin: 0.3rem 0.6rem 0.3rem 0 ;
  font-size: 0.4rem;
}
</style>
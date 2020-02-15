<template>
  <div>
    <el-row>
      <el-col :span="10" v-for="item in this.friendList" :key="item.friendId" offset="1">
        <el-card >
          <img :src=item.friendInfo.avatar alt="图片不存在" class="image" />
            <p style="font-size:0.5rem; ">昵称:{{item.friendInfo.nickName}}</p>

            <div class="loc">
              <span v-if="item.status == 1"><i class="el-icon-view"/>用户上线</span>
              <span v-else><i class="el-icon-view"/>用户离线</span>
            </div>

            <div class="button">
              <el-button
                plain
                type="primary"
                @click="toChatroom(item.friendId, item.friendInfo.nickName, item.friendInfo.avatar)"
              >聊天</el-button>
              <el-button 
                plain
                type="warning"
                @click="deleteFriend(item.friendId)"
              >删除好友</el-button>
              <el-button 
                plain
                type="info"
                @click="toHistoryPage(item.friendId)"
              >历史记录</el-button> 
            </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { GetMyFriendList } from "@/stores/modules/user";
import { deleteMyFriend, getHistoryReadList } from "@/api/friendOperation";

export default {
  components: {},
  data() {
    //这里存放数据
    return {
      messagelist:[],
    };
  },
  //监听属性 类似于data概念
  computed: {
    friendList: function() {
      const all = this.$store.getters.myFriendList;
      const groupid = this.$route.params.groupId;
      for (let i = 0; i < all.length; i++) {
        if (all[i].id == groupid) {
          return all[i].friends;
        }
      }
    },
    messageList: function(){
      return this.messagelist;
    }
  },
  methods: {
    toHistoryPage(toId){
      this.$router.push({
        name: "privateHistoryPage",
        params: {fromId: this.$store.getters.userId, toId: toId},
      });
    },
    init(){
      this.myFriendList();
    },
    toChatroom(id, name, pic) {
      this.$router.push({
        name: "privateChatRoom",
        params: { friendId: id, name: name, avatar: pic},
      });
    },
    deleteFriend(id) {
      const myid = this.$store.getters.userId;
      deleteMyFriend(myid, id)
        .then(response => {
          const data = response.data.data;
          if (data != "0") {
            this.$message({
              message: "成功删除好友",
              type: "success"
            });
            this.$store.dispatch("GetMyFriendList", myid);
          } else {
            this.$message({
              message: "删除好友失败",
              type: "warning"
            });
          }
        })
        .catch(error => {
          console.log("!!!!有错误", error);
        });
    }
  },
};
</script>
<style scoped>
.button {
  margin: 0 0 0.3rem 0;
  float: right;
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
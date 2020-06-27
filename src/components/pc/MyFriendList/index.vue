<template>
  <div>
    <el-row>
      <el-col :span="11" v-for="(item,ind) in this.friendList" :key="ind" :offset="1">
        <el-card >
          <template>
            <div class="demo-type">
              <div>
                <el-avatar shape="circle" :size="70"> {{item.friendInfo.nickName}} </el-avatar>
              </div>
            </div>
          </template>
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
              <el-button 
                plain
                type="info"
                @click="dialogTableVisible = true"
              >移动分组</el-button> 
            </div>
            <el-dialog title="分组" :visible.sync="dialogTableVisible">
                <el-table
                  ref="singleTable"
                  :data="tableData"
                  highlight-current-row
                  @current-change="handleCurrentChange"
                  style="width: 100%; ">
                  <el-table-column
                    type="index"
                    width="150%">
                  </el-table-column>
                  <el-table-column
                    property="typeName"
                    label="分组名"
                    width="300%">
                  </el-table-column>
                </el-table>
                <el-button @click="changeFriendGroup(item.friendId)">确认</el-button>
                <el-button @click="resetFriendGroup()">取消</el-button>
            </el-dialog>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { GetMyFriendList } from "@/stores/modules/user";
import { deleteMyFriend, getHistoryReadList } from "@/api/friendOperation";
import {getMyFriendList, changeFriendGroup} from "./../../../api/friendOperation"

export default {
  components: {},
  data() {
    return {
      messagelist:[],
      dialogTableVisible: false,
      tableData:this.$store.getters.myFriendList,
      currentRow: null
    };
  },
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
    changeFriendGroup(id){
      if (!id || this.currentRow === null) {
        return
      }
      changeFriendGroup(this.$store.getters.userId, id, this.currentRow.id).then(res => {
        this.$store.dispatch("GetMyFriendList", this.$store.getters.userId).then(res => {
          this.dialogTableVisible = false;
        })
      })
    },
    handleCurrentChange(val) {
      this.currentRow = val;
    },
    resetFriendGroup(){
      this.currentRow = null;
      this.dialogTableVisible = false;
    },
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
          getMyFriendList(this.$store.getters.userId).then(res =>{
            const data = res.data.data;
            this.$store.dispatch("GetAllFriend", data).then(res =>{}).catch(err =>{console.log(err)});
          })
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

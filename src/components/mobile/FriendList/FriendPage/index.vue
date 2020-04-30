<template>
  <div>
    <van-nav-bar
      :title="nname"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      id="head"
    />
    <div class="body">
      <img :src=this.avatar />
      <van-divider />
      <p>用户:{{nname}}</p>
      <van-divider/>

      <div class="loc">
        <span v-if="this.status === 1"><van-icon name="eye-o"/>用户上线</span>
        <span v-else><van-icon name="closed-eye"/>用户离线</span>
      </div>
      <van-divider/>
      <van-button @click="topath()" style="margin-top:0.1rem;width:100%">移动分组</van-button>
    </div>

    <van-tabbar v-model="active" id='foot'>
      <van-tabbar-item icon="chat-o" @click="toChatroom">聊天</van-tabbar-item>
      <van-tabbar-item icon="more-o" @click="toHistoryPage">查看历史记录</van-tabbar-item>
      <van-tabbar-item icon="ellipsis" @click="deleteFriend">删除好友</van-tabbar-item>
    </van-tabbar>
    <!-- <van-dialog 
      v-model="dialogTableVisible" 
      title="分组" 
      show-cancel-button
      :confirm="changeFriendGroup()"
      :cancel="resetFriendGroup">
      <van-dropdown-menu>
        <van-dropdown-item v-model="radio" :options="tableData" />
      </van-dropdown-menu>
      <van-radio-group v-model="radio" style="padding-left:0.5rem;padding-bottom:0.2rem" >
        <div v-for="(item, ind) in tableData" :key="ind" style="padding-bottom:0.2rem">
          <van-radio name=item.id icon-size="24px" :click="handleCurrentChange()">{{item.typeName}}</van-radio>
        </div>
      </van-radio-group>
    </van-dialog> -->
  </div>
</template>

<script>
import {deleteMyFriend, changeFriendGroup} from '../../../../api/friendOperation'

export default {
  name:"friendPage",
  data(){
    return{
      active:-1,
      avatar: '',
      nname:'',
      status: 0,
      friendId: this.$route.params.id,
      // dialogTableVisible: false,
    }
  },
  methods:{
    topath(){
      this.$router.push({name:"changeFriendGroup", params:{friendId:this.friendId}});
    },
    
    toHistoryPage(){
      this.$router.push({
        name: "privateHistoryPage",
        params: {fromId: this.$store.getters.userId, toId: this.friendId},
      });
    },
    init(){
      const allFriend = this.$store.getters.allFriend;
      for(let i = 0; i < allFriend.length; i ++){
        if(allFriend[i].friendId === this.friendId){
          this.avatar = allFriend[i].friendInfo.avatar;
          this.nname = allFriend[i].friendInfo.nickName;
          this.status = allFriend[i].status;
          break;
        }
      }
    },
    onClickLeft(){
      this.$router.push({path:"/friendList"});
    },
    deleteFriend() {
      const myid = this.$store.getters.userId;
      deleteMyFriend(myid, this.friendId)
        .then(response => {
          const data = response.data.data;
          if (data != "0") {
            this.$toast("成功删除好友");
            this.$store.dispatch("GetMyFriendList", myid);
            this.$router.push({path:'/friendList'});
          } else {
            this.$toast("删除好友失败");
          }
        })
        .catch(error => {
          console.log("!!!!有错误", error);
        });
    },
    toChatroom() {
      this.$router.push({
        name: "privateChatRoom",
        params: { friendId: this.friendId, name: this.nname, avatar: this.avatar},
      });
    },
  },
  mounted(){
    this.init();
  }
}
</script>

<style scoped>
#head{
  position: absolute;
  left: 0rem;
  top: 0rem;
  width: 100%;
}
.body{
  margin-top: 1.4rem;
  padding-top: 0.3rem;
  background-color: rgb(250, 250, 250);
  font-size:0.5rem
}
</style>
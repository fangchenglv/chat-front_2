<template>
  <div class="head" >
    <br>
    <div v-for="item in findList" :key="item.id">
      <van-card >
        <div slot="title">
          <p>{{item.userName}}</p>
        </div>
        <div slot="footer">
          <van-button @click="changeShow">选择好友分组</van-button>
          <van-button @click="sendRequest(item.id, userid)">发送好友申请</van-button>
        </div>
      </van-card>
      <br>
    </div>

    <van-dialog
      v-model="show"
      title="选择好友分组"
      show-cancel-button >
      <van-radio-group v-model="group" v-for="item in friendGroupList" :key="item.id">
        <van-radio :name=item.id >{{item.typeName}}</van-radio>
      </van-radio-group>
    </van-dialog>
  </div>
</template>

<script>
import {mapGetters} from "vuex"
import { requestFriend, searchFriend } from "@/api/friendOperation"

export default {
  name:"newFriendResult",
  data(){
    return{
      show:false,
      group:-1,
    }
  },
  computed:{
    ...mapGetters(["beSearchFriend", "userId", "myFriendList"]),
    findList: function() {
      return this.beSearchFriend;
    },
    userid: function() {
      return this.userId;
    },
    friendGroupList:function(){
      return this.myFriendList;
    },
  },
  methods:{
    changeShow(){
      this.show = true;
    },
    sendRequest(friendId, userId){
      if(this.group === -1){
        this.$toast("请选择好友分组再发送请求");
        this.group = -1;
        return
      }
      requestFriend(this.group, friendId, userId)
      .then(response => {
        let data = response.data.data;
        if (data === "1") {
          this.$toast("好友申请已经发出");
        }  else if (data === -1 || data === "ALREADY_FRIENDS") {
          this.$toast("该用户已经是你的好友");
        } else if (data === -2 || data === "NOT_YOURSELF") {
          this.$toast("无法添加自己为好友");
        } else if (data === -3 || data === "ALREADY_SENT") {
          this.$toast("请不要重复发送好友请求");
        }
        this.group = -1;
      })
      .catch(err => {
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!", err);
      });
    },
  }
}
</script>

<style lang="scss" scoped>
.head{
  text-align:left
}
  p{
    font-size:0.7rem; margin-left:0.3rem
  }
  .van-card{
    margin-top: 0rem;
    background-color:#fff
  }
  .van-radio{
    margin-left:0.5rem;margin-bottom:0.3rem;
  }
</style>

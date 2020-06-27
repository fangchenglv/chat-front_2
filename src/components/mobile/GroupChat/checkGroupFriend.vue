<template>
  <div>
    <van-nav-bar
      title="本群好友列表"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      id="head"
    />
    <div style="margin-top:1.3rem">
      <van-grid :border="false" :column-num="5">
        <van-grid-item v-for="(item, ind) in groupFriend" :key="ind"  border>
          <div style="float:left;width:2rem; height:2rem;background-color:rgba(100,100,100,0.45);margin-top: 0rem;border-radius:50%;">
            <p style="color: #0c0c0c ;margin-top:0.6rem;font-size: 20px">{{item.userName}}</p>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

  </div>

</template>

<script>
import { getMyGroupChatPerson } from "../../../api/friendOperation";

export default {
  data(){
    return{
      groupFriend: [],
    }
  },
  mounted(){
    this.getGroupMember()
  },
  methods: {
    onClickLeft(){
      this.$router.back();
    },
    getGroupMember(){
      getMyGroupChatPerson(this.$route.params.groupId)
        .then(res =>{
          console.log("群成员信息", res);
          let tmpGroupFriend = res.data.data;
          let len = tmpGroupFriend.length;
          for (let i = 0; i < len; i++) {
            this.groupFriend.push({
              userName: tmpGroupFriend[i].user.nickName,
              avatar: tmpGroupFriend[i].user.avatar
            })
          }
        })
    },
  }
}
</script>

<style>

</style>

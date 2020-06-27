<template>
  <div class="head">
    <van-cell-group title="好友操作">
      <van-cell title="新建好友分组" is-link @click="newGroup" />
      <van-cell title="删除好友分组" is-link @click="changeFriendGroup" />
      <van-cell title="添加新的好友" is-link @click="newFriend" />
      <van-cell title="查询好友申请并处理申请" is-link @click="checkAndReselve"/>
      <van-cell title="查询已经处理的好友申请" is-link @click="historyRequest" />
    </van-cell-group>
    <van-cell-group title="群组操作">
      <van-cell title="新建群聊" is-link @click="newFriendChat" />
    </van-cell-group>

  </div>
</template>

<script>
export default {
  name:"friendOperation",
  methods:{
    changeFriendGroup(){
      this.$router.push({path:"/changeFriendGroup"})
    },
    newFriendChat(){
      this.$router.push({path:"/newGroupChat"});
    },
    newGroup(){
      this.$router.push({path:"/newFriendGroup"}).catch(err => {
        console.log(err);
      });
    },
    newFriend(){
      this.$router.push({path:"/newFriend"});
    },
    checkAndReselve(){
      this.$router.push({path:"/ReselveFriendRequset"});
    },
    historyRequest(){
      this.$router.push({path:"/historyFriend"});
    }
  }
}
</script>

<style scoped>
.head{
  margin-top: 1rem;
  margin-bottom: 1rem;
  text-align: left;
  background-color: rgb(250,250,250);
}
.item{
  line-height: 1rem;
  background-color: #fff;
  border-bottom: 0.001rem solid #ccc;
}
</style>
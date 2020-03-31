<template>
  <div style="height:100%">
    <div class="head">
      <span>{{tit}}</span>
    </div>
    <!-- <van-nav-bar
      :title="tit"
    /> -->
    <!-- <van-divider style="margin-bottom:1rem"></van-divider> -->

    <div class="medium" >
      <router-view></router-view>
    </div>

    <van-tabbar v-model="active" class="foot">
      <van-tabbar-item icon="chat-o" @click="chatList">聊天</van-tabbar-item>
      <van-tabbar-item icon="friends-o" @click="friendList">通讯录</van-tabbar-item>
      <van-tabbar-item icon="manager-o" @click="manage">操作</van-tabbar-item>
      <van-tabbar-item icon="user-o" @click="ownPage">我</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>

export default {
  name:"Bottom",
  data(){
    return{
      tit:'聊天',
      active:-1,
    }
  },
  // mounted(){
  //   window.removeEventListener('beforeunload', this.beforeunloadHandler())
  // },
  // destroyed(){
  //   window.removeEventListener('beforeunload', this.beforeunloadHandler())
  // },
  methods:{
    //实现点击浏览器叉号就退出的功能。
    // beforeunloadHandler(){
    //   logout_(this.$store.getters.userId);
    // },
    chatList(){
      this.tit = '聊天';
      this.$router.push({path:'/chatList'});
    },
    manage(){
      this.tit = "好友操作";
      this.$router.push({path:'/friendOperation'});
    },
    friendList(){
      this.tit = '好友列表';
      this.$router.push({path:"/friendList"});
    },
    ownPage(){
      this.tit = '我的信息';
      this.$router.push({path: '/personalPage'});
    }
  }
}
</script>

<style scoped>
.head{
  background-color: #fff;
  font-size: 0.4rem;
  width: 100%;
  position: absolute;
  left: 0rem;
  top: 0rem;
  line-height: 1rem;
  margin-bottom: 0.1rem;
}
.medium{
  height: 100%;
  margin-top: 1.1rem; 
}
.foot{
  width: 100%;
}
</style>
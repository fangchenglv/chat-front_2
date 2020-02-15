<template>
  <div>
    
    <div class="head"><span>{{tit}}</span></div>
    <!-- <van-row class="foot">
        <van-col span="6" class="list" @click="chatList">
          <van-icon name="chat-o"></van-icon>
          <span>聊天</span>
        </van-col>
        <van-col span="6" class="list" @click="friendList">
          <van-icon name="chat-o"></van-icon>
          <span>通讯录</span>
        </van-col>
        <van-col span="6" class="list" @click="manage">
          <van-icon name="manager-o"></van-icon>
          <span>好友操作</span>
        </van-col>
        <van-col span="6" class="list" @click="ownPage">
          <van-icon name="user-o"></van-icon>
          <span>我</span>
        </van-col>
    </van-row> -->
    <van-tabbar v-model="active">
      <van-tabbar-item icon="chat-o" @click="chatList">聊天</van-tabbar-item>
      <van-tabbar-item icon="friends-o" @click="friendList">通讯录</van-tabbar-item>
      <van-tabbar-item icon="manager-o" @click="manage">好友操作</van-tabbar-item>
      <van-tabbar-item icon="user-o" @click="ownPage">我</van-tabbar-item>
    </van-tabbar>
    
  </div>
</template>

<script>
// import { logout_ } from "@/api/login";

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
  /* background: #ddd; */
  background-color: #fff;
  font-size: 0.4rem;
  width: 100%;
  position: absolute;
  left: 0rem;
  top: 0rem;
  line-height: 1rem;
}
/* .foot{
  background-color:#ddd;
  font-size: 0.4rem;
  width: 100%;
  position:absolute;
  left: 0rem;
  bottom: 0rem;
  
}
.list{
  line-height: 1rem;
} */
</style>
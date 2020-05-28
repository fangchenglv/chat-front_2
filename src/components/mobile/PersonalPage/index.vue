<template>
  <div class="head">
<!--    <img src= "myAvator" style="background-color:rgb(250,250,250)"/>-->
    <van-divider style="margin: 0rem;"/>
    <p style="margin: 0rem;padding:0.25rem 0rem;background-color: rgb(250, 250, 250);font-size:0.5rem">
      用户名:{{myName}}
    </p>
    <van-divider style="margin: 0rem;"/>
    <p style="margin: 0rem;padding:0.25rem 0rem;background-color: rgb(250, 250, 250);font-size:0.5rem">
      用户昵称:{{myNickname}}
    </p>
    <van-divider style="margin: 0.1rem;"/>
    <div style="background-color:rgb(250, 250, 250);">
      <p @click="exit" style="margin: 0rem;padding:0.25rem 0rem;font-size:0.5rem">登出</p>
    </div>

  </div>
  <!-- <van-button>退出</van-button> -->
</template>

<script>
import { logout_ } from "@/api/login";

export default {
  name:'personalPage',
  data(){
    return{
      myName: this.$store.getters.userName,
      // myAvator: this.$store.getters.userAvatar,
      myNickname: this.$store.getters.userNickname,
    }
  },
  // beforeDestroy(){
  //   exit()
  // },
  methods:{
    // beforeunloadHandler: async function(){
    //   this.$websocket.state.websock.onclose = function (e) {
    //     console.log(this.$websocket.state.websock);
    //     this.$websocket.state.regisMsg = undefined;
    //   };
    // },
    exit(){
      // this.$websocket.websock.close()
      this.$router.push({path:"/login"})
      logout_(this.$store.getters.userId);
    }

  }
}
</script>

<style scoped>
.head{
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>

<template>
  <div class="head">
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
</template>

<script>
import { logout_ } from "@/api/login";

export default {
  name:'personalPage',
  data(){
    return{
      myName: this.$store.getters.userName,
      myNickname: this.$store.getters.userNickname,
    }
  },
  methods:{
    exit(){
      // this.$websocket.websock.close()
      // this.$router.push({path:"/login"})
      // logout_(this.$store.getters.userId);
      logout_(this.$store.getters.userId).then(() => {
        this.$store.commit("DELETE_TOKEN");
      })
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

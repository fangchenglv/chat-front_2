<template>
  <div class="head">
    <van-divider class="dis"/>
    <p >
      用户名:{{myName}}
    </p>
    <van-divider class="dis"/>
    <p >
      用户昵称:{{myNickname}}
    </p>
    <van-divider class="van-dis"/>
    <div>
      <p @click="exit">登出</p>
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

<style  lang="scss" scoped>
.head{
  margin-top: 1rem;
  margin-bottom: 1rem;
}
  p{
    margin: 0rem;padding:0.25rem 0rem;
    background-color: rgb(250, 250, 250);
    font-size:0.5rem
  }
  .dis{
    margin: 0rem;
  }
.van-dis{
  margin: 0.1rem;
}
</style>

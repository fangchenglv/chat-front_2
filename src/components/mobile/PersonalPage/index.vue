<template>
  <div class="head">个人信息页
    <van-button @click="beforeunloadHandler">退出</van-button>
  </div>
  <!-- <van-button>退出</van-button> -->
</template>

<script>
import { logout_ } from "@/api/login";

export default {
  name:'personalPage',
  methods:{
    beforeunloadHandler(){
      this.$router.push({path:"/login"});
      logout_(this.$store.getters.userId);
    },
  }
}
</script>

<style scoped>
.head{
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>
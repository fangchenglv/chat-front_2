<template>
  <div>
    <van-nav-bar
      title="历史好友请求"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      id="head"
    />
    
  </div>
</template>

<script>
export default {
  name:"historyFriend",
  methods:{
    onClickLeft(){
      this.$router.push({path:"/friendOperation"});
    }
  }
}
</script>

<style>

</style>
<template>
  <div id='head'>
    <van-nav-bar
      title="添加新好友"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      id="nav"
      style="margin-top:0rem;"
    />
    <van-cell-group style="text-align:left;">
      <van-field
        v-model="message"
        rows="1"
        autosize
        label="好友名"
        type="textarea"
        right-icon="arrow"
        placeholder="请输入查找的好友名称"
        @click-right-icon="submitRequest"
        id="req"/>
    </van-cell-group>
    <router-view></router-view>
  </div>

</template>

<script>

export default {
  name:"newFiend",
  data(){
    return{
      message:"",
    }
  },
  methods:{
    onClickLeft(){
      this.$router.push({path:"/friendOperation"});
    },
    submitRequest(){
      // console.log("点击了右面的图标");
      if(this.message === ''){
        this.$toast("输入的好友名不能为空");
        return
      }
      this.$store.dispatch("SearchFriend", this.message)
      .then(response => {
        // let findFriendList = response.data.data;
        this.$router.push({ path: "/newFriend/result" });
      })
      .catch(err => {
        console.log("!!!!!!!!!!!!!!!", err);
      });
}
  }
}
</script>

<style scoped>

</style>
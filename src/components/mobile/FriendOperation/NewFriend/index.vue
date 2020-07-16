<template>
  <div id='head'>
    <van-nav-bar
      title="添加新好友"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      id="nav"/>

    <van-cell-group >
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
      if(this.message === ''){
        this.$toast("输入的好友名不能为空");
        return
      }
      this.$store.dispatch("SearchFriend", this.message)
      .then(response => {
        if(response.data.data.length==0){
          this.$toast("该用户不存在");
        }
        else {
          this.$router.push({ path: "/newFriend/result" });
        }
      })
      .catch(err => {
        console.log("!!!!!!!!!!!!!!!", err);
      });
}
  }
}
</script>

<style lang="scss" scoped>
.van-nav-bar{
  margin-top:0rem;
}
  .van-cell-group{
    text-align:left;
  }
</style>

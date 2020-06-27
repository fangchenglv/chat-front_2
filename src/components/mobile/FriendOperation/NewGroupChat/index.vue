<template>
  <div >
    <van-nav-bar
      title="新建群聊"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />
    <van-cell-group style="margin-top:0.1rem; text-align:left">
      <van-field
        v-model="name"
        rows="1"
        autosize
        label="新的群名"
        type="textarea"
        placeholder="请输入新建群名称"
      />
      <van-field
        v-model="descriptor"
        rows="1"
        autosize
        label="新的群描述"
        type="textarea"
        placeholder="请输入新群的描述"
      />
    </van-cell-group>
    <div id='btn'>
      <van-button
        plain
        type='info'
        style="margin-right:0.5rem"
        @click="handleGroup">
        确定
      </van-button>
      <van-button
        plain
        type='info'
        style="margin-left:0.5rem"
        @click="reset">
        重置
      </van-button>
    </div>
  </div>
</template>

<script>
import {buildNewGroupChat} from "../../../../api/friendOperation"

export default {
  data(){
    return{
    userId:this.$store.getters.userId,
    name:"",
    descriptor:"",
    }
  },
  methods:{
    onClickLeft(){
      this.$router.push({path:"/friendOperation"});
    },
    handleGroup(){
      if(this.name.trim().length === 0){
          this.$toast("请输入新建的群名");
          return;
      }
      buildNewGroupChat(this.userId, this.name, this.descriptor)
        .then(res => {
          if(res.status === 200 && res.data.status === "success"){
            this.$toast("新建群聊成功");
          } else {
            this.$message("新建群聊失败");
          }
        })
        .catch(e => {
            console.log(e);
        })
      this.name = "";
      this.descriptor = "";
    },
    reset(){
      this.name = "";
      this.descriptor = "";
    },
  }
}
</script>

<style scoped>
#btn{
  margin-top: 1rem;
}
</style>
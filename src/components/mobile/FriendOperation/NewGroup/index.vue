<template>
  <div >
    <van-nav-bar
      title="新建好友分组"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />
    <van-cell-group style="margin-top:0.1rem; text-align:left">
      <van-field
        v-model="message"
        rows="1"
        autosize
        label="分组名"
        type="textarea"
        placeholder="请输入新建分组名称"
      />
    </van-cell-group>
    <div id='btn'>
      <van-button
        plain
        type='info'
        style="margin-right:0.5rem"
        @click="submitForm">
        确定
      </van-button>
      <van-button
        plain
        type='info'
        style="margin-left:0.5rem"
        @click="resetForm">
        重置
      </van-button>
    </div>

  </div>
</template>

<script>
import {setFriendGroup} from '../../../../api/friendOperation'
export default {
  name:'newGrop',
  data(){
    return{
      message:"",
    }
  },
  methods:{
    onClickLeft(){
      this.$router.push({path:"/friendOperation"});
    },
    submitForm(){
      if(this.message === ""){
        this.$toast("输入的组名不能为空");
        return
      }
      setFriendGroup(this.message, this.$store.getters.userId).then(responce=>{
          const data = responce.data.status;
          if(data === "success"){
              this.$toast("分组创建成功");
              this.message = "";
          }
      }).catch(error=>{
          console.log('!!!!!!!!!!!!!!!!', error);
      })
    },
    resetForm(){
      this.message = "";
    }
  }
}
</script>

<style scoped>
#btn{
  margin-top: 1rem;
}
</style>
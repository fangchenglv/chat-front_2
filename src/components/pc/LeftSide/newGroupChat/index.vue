<template>
  <div>
    <el-input v-model="name" placeholder="请输入群名" style="margin: 0.5rem 0rem 0.5rem 0;"></el-input>
    <el-input v-model="descriptor" placeholder="请输入群描述" style="margin-bottom:1rem"></el-input>
    <div>
      <el-button type="primary" plain @click="handleGroup()" style="margin-right:0.5rem">确认</el-button>
      <el-button type="warning" plain @click="reset()" style="margin-left:0.5rem">取消</el-button>
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
    handleGroup(){
      // console.log(this.userId);
      if(this.name.trim().length === 0){
        this.$message({
          message:"请输入新建的群名",
          type:"error"
        });
        return;
      }
      buildNewGroupChat(this.userId, this.name, this.descriptor)
        .then(res => {
          if(res.status === 200 && res.data.status === "success"){
            this.$message({
              message:"新建群聊成功",
              type:"success",
            });
          } else {
            this.$message({
              message:"新建群聊失败",
              type:"error",
            });
          }
          this.$router.replace({path:"/home"});
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

<style>

</style>
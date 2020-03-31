<template>
<div>
  <el-form :model="ruleForm" :rules="rules" ref="ruleForm">
    <el-form-item label="新建分组" prop="name">
      <el-input 
        v-model="ruleForm.name" 
        style="width:85%;text-align:left;"
        placeholder="添加分组名">
      </el-input>
    </el-form-item>
    <el-form-item >
      <el-button plain type="primary" @click="submitForm('ruleForm')">立即创建</el-button>
      <el-button plain type="info" @click="resetForm('ruleForm')">重置</el-button>
    </el-form-item>
  </el-form>
</div>
</template>

<script>
import {setFriendGroup} from '@/api/friendOperation'   //新建好友分组的函数
export default {
  data(){
    return{
      ruleForm:{
        name:"",
      },
      rules:{
        name:[
          { required: true, message: '请输入分组名称', trigger: 'blur' },
          { min: 0, max: 100, message: '长度在 0 到 100 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          setFriendGroup(this.ruleForm.name, this.$store.getters.userId)
            .then(responce=>{
              const data = responce.data.status;
              // console.log('tag', data);
              if(data === "success"){
                this.$message({
                    message:"分组创建成功",
                    type:"success"});
                this.$router.push({path:"/home"});
              }
            }).catch(error=>{
              console.log('!!!!!!!!!!!!!!!!', error);
            })
        } else {
            console.log('error submit!!');
            return false;
        }
      });
    },
  resetForm(formName) {
    this.$refs[formName].resetFields();
  }
  },
}
</script>

<style>

</style>
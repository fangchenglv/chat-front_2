<template>
  <div>
    <el-form :model="ruleForm2" :rules="rules2" ref="ruleForm2">
      <el-form-item>
        <el-input
          v-model="ruleForm2.userName"
          auto-complete="off"
          placeholder="账号"
          style="margin-top:0.58rem;"
        ></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          type="password"
          v-model="ruleForm2.password"
          auto-complete="off"
          placeholder="密码"
        ></el-input>
      </el-form-item>
      <el-form-item prop="checkPass">
        <el-input
          type="password"
          v-model="ruleForm2.checkPass"
          auto-complete="off"
          placeholder="确认密码"
        ></el-input>
      </el-form-item>
      <el-form-item prop="nickname">
        <el-input
          v-model="ruleForm2.nickname"
          placeholder="昵称"
          auto-complete="off"
        ></el-input>
      </el-form-item>
      <el-form-item prop="gender">
        <el-input
          v-model="ruleForm2.gender"
          placeholder="性别"
          auto-complete="off"
        ></el-input>
      </el-form-item>
      <el-form-item prop="email">
        <el-input
          v-model="ruleForm2.email"
          placeholder="邮箱"
          auto-complete="off"
        ></el-input>
      </el-form-item>
      <el-form-item prop="phone">
        <el-input
          v-model="ruleForm2.phone"
          placeholder="手机号"
          auto-complete="off"
          @keyup.enter.native="submitForm"
        ></el-input>
      </el-form-item>
      <el-form-item class="regisbtn">
        <el-button
          type="primary"
          plain
          @click.native.prevent="handleRegister"
          :loading="loading"
          style="margin-right:0.5rem;"
        >注册</el-button>
        <el-button
          type="primary"
          plain
          @click="gotoLogin"
          :loading="loading"
          style="margin-left:0.5rem;"
        >登录</el-button>
      </el-form-item>
      <!-- <p @click="gotoLogin" class="returnback">已有帐号？立即登录</p> -->
    </el-form>
  </div>
</template>

<script>
import {isvalidPhoneNumber, isvalidEmail} from "../../../utils/validate"
import {register} from "../../../api/login"

export default {
  name: 'registerPage',
  data(){
    let checkTel = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入手机号码"));
      } else if (isvalidPhoneNumber(value) === false) {
        callback(new Error("请输入合法手机号码"));
      } else {
        callback();
      }
    };
    let checkEmail = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入邮箱"));
      } else if (isvalidEmail(value) === false) {
        callback(new Error("请输入有效邮箱地址"));
      } else {
        callback();
      }
    };
    let validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        callback();
      }
    };
    let validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请确认密码"));
      } else if (value !== this.ruleForm2.password) {
        callback(new Error("两次输入的密码不同"));
      } else {
        callback();
      }
    };
    let validateGender = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入性别"));
      } else if (value === "男" || value === "女") {
        callback();
      } else {
        callback(new Error("没有此性别"));
      }
    };
    return{
      ruleForm2: {
        checkPass: "",
        userName: "", //用户名
        password: "", //密码  需要验证
        nickname: "", //昵称
        gender: "", //性别
        email: "", //邮箱  需要验证
        phone: "" //电话  需要验证
      },
      rules2: {
        password: [{ validator: validatePass, trigger: "change" }],
        phone: [{ validator: checkTel, trigger: "change" }],
        email: [{ validator: checkEmail, trigger: "change" }],
        checkPass: [{ validator: validatePass2, trigger: "change" }],
        gender: [{ validator: validateGender, trigger: "change" }]
      },
      loading: false,
    }
  },
  methods:{
    handleRegister(){
      this.$refs.ruleForm2.validate(valid => {
        if (valid) {
          if (this.ruleForm2.gender === "男") {
            this.ruleForm2.gender = "1";
          } else {
            this.ruleForm2.gender = "0";
          }
          register(
            this.ruleForm2.userName.trim(),
            this.ruleForm2.password.trim(),
            this.ruleForm2.nickname.trim(),
            this.ruleForm2.gender.trim(),
            this.ruleForm2.email.trim(),
            this.ruleForm2.phone.trim()
          )
          .then(response => {
            if (response.data.status === "success") {
              this.$message({message:"注册成功",type:"success"});
              this.loading = false;
              this.$router.push({ path: "/login" });
            }
          })
          .catch(error => {
            this.loading = false;
            console.log("!!!!!!!!!!!!!!!!!!!!", error);
          });
        } else {
          console.log("参数验证不合法");
          return false;
        }});
    },
    gotoLogin(){
      this.$router.push({path: '/login'});
    }
  }
}
</script>

<style scoped>
.el-form{
  margin: 0 3rem 0 3rem;
}
</style>

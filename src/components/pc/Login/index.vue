<template>
  <div >
    <div>
      <el-form ref="ruleForm1" :model="ruleForm1" :rules="rules1">
        <el-form-item prop="userName">
          <el-input
            placeholder="请输入账号"
            v-model="ruleForm1.userName"
            auto-complete="on"
            style="margin-top:100px "
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            placeholder="请输入密码"
            v-model="ruleForm1.password"
            type="password"
            auto-complete="on"
            style="margin-top:50px "
            @keyup.enter.native="handleLogin"
          ></el-input>
        </el-form-item>
        <el-form-item >
          <el-button
            type="primary"
            plain
            :loading="loading"
            @click.native.prevent="handleLogin"
          >登陆</el-button>
          <el-button
            type="primary"
            plain
            @click="gotoRegister"
          >注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { isvalidUserName } from "../../../utils/validate";
import { callbackify } from "util";
import {mapGetters} from "vuex"

export default {
  name: "loginPage",
  data() {
    let validateUsername = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入合法用户"));
      } else if (isvalidUserName(value) === false) {
        callback(new Error("输入的用户名格式不对"));
      } else {
        callback();
      }
    };
    let validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("密码不能为空"));
      } else {
        callback();
      }
    };

    return {
      ruleForm1: {
        userName: "",
        password: ""
      },
      rules1: {
        userName: [{ validator: validateUsername, trigger: "change" }],
        password: [{ validator: validatePass, trigger: "change" }]
      },
      loading: false,
    };
  },
  computed:{
    ...mapGetters(["socket", "userId"]),
  },
  methods: {
    gotoRegister() {
      this.$router.push({ path: "/register" });
    },
    handleLogin() {
      this.$refs.ruleForm1.validate(valid => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch("Login", this.ruleForm1) //调用的是store里面的Login函数，传入参数是自己的表单
            .then(() => {
              // // 开发环境地址
              //产品环境地址
              const wsUrl = "wss://65.49.204.236:8081/ws"
              // const wsUrl = "wss://123.56.232.247:8081/ws"
              let uid = this.userId;
              uid = "" + uid;
              let regisMsg = JSON.stringify({"userId" : ""+this.userId,"type" : "REGISTER"});
              this.$websocket.dispatch("StartWebsocket", [wsUrl, regisMsg])
              .then((res) =>{
                this.loading = false;
                this.$router.replace({ path: "/solveRequest" });
              })
            })
            .catch(() => {
              this.loading = false;
            });
        } else {
          console.log("参数验证不合法");
          return false;
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.el-form{
  margin-left: 3rem;
  margin-right: 3rem;
}
.el-form-item{
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>

<template>
  <div>
    <!-- <Header title="登陆页面" /> -->
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
      <!-- <p @click="gotoRegister" style="margin-left:43.5%">没有帐号，注册一个</p> -->
    </div>
    <!-- <keep-alive>
      <router-view />
    </keep-alive>-->
  </div>
</template>

<script>
import { isvalidUserName } from "../../../utils/validate";
import { callbackify } from "util";
import {mapGetters} from "vuex"
// import messageHandle from "../../../api/handleWebsocket"

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
              // 开发环境地址
              const wsUrl = 'wss' + this.socket.slice(5,23) + '8081/ws';
              //产品环境地址
              // const wsUrl = "wss://127.0.0.1:8081/ws";
              let uid = this.userId;
              uid = "" + uid;
              // url, msgCallback, name, regisMsg
              let regisMsg = JSON.stringify({"userId" : ""+this.userId,"type" : "REGISTER"});
              // this.$store.dispatch('StartWebsocket',  [wsUrl,  "网页聊天", regisMsg]).then(res =>{
              //   // console.log("页面连接成功websocket");
              // }).catch();
              // this.websock = this.$store.getters.sock;
              // this.websock.connect(JSON.stringify({"userId" : ""+this.userId,"type" : "REGISTER"}));
              this.$websocket.dispatch("StartWebsocket", [wsUrl, regisMsg]).then((res) =>{
                // console.log("可能登录了吧", res);
              })
              this.loading = false;
              this.$router.replace({ path: "/home" }); //这儿有问题，之后改路由的时候好好看看！
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

<style scoped>
.el-form{
  margin-left: 3rem;
  margin-right: 3rem;
}
.el-form-item{
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>
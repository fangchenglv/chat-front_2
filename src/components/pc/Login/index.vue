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
import NodeRSA from 'node-rsa'
import JSEncrypt from 'jsencrypt'

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
      keyval:null,
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
    encryptedData(publicKey, data) {
      // 新建JSEncrypt对象
      let encryptor = new JSEncrypt();
      // 设置公钥
      encryptor.setPublicKey(publicKey);
      // 加密数据
      return encryptor.encrypt(data);
    },
    decodeData(privatekey,data){
      // 新建JSEncrypt对象
      let decrypt = new JSEncrypt();
      // 设置私钥
      decrypt.setPrivateKey(privatekey);
      // 解密数据
      return decrypt.decrypt(data);
    },

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
              // const wsUrl = "ws://123.56.232.247:8081/ws"
              let uid = this.userId;
              uid = "" + uid;
              console.log("那么这里的userid是多少？",this.userId)
              //开始走生成密钥和存在localstorage的步骤
              if(!window.localStorage){
                alert("浏览器不支持localstorage");
                return false;
              }else{

                var storage=localStorage;
                console.log("yonghuid是啥:",this.userId)
                var keyname="keyValue"+this.userId;
                console.log("keyname是啥:",keyname)
                for(var i=0; i<localStorage.length;i++){
                  // console.log('第'+i+'条数据key为：'+localStorage.key(i)+',value为：'+localStorage.getItem(localStorage.key(i)));
                  if(localStorage.key(i)==keyname){
                    console.log("好像进来了")
                    this.keyval=JSON.parse(localStorage.getItem(localStorage.key(i)))
                  }
                }
                //如果该userid没有key则生成并存储
                if (this.keyval==null){
                  const key = new NodeRSA({ b: 4096 }); //生成2048位的密钥
                  let publicDer = key.exportKey("pkcs8-public-pem");  //公钥
                  let privateDer = key.exportKey("pkcs1-private-pem");//私钥

                  // console.log('公钥',publicDer)
                  // console.log('================')
                  // console.log('私钥',privateDer)
                  var keyValue={
                    userid:this.userId,
                    public:publicDer,
                    private:privateDer
                  };
                  var k=JSON.stringify(keyValue);
                  keyname="keyValue"+this.userId;
                  storage.setItem(keyname,k);
                }
                let regisMsg = JSON.stringify({"type" : "REGISTER","userId" : ""+this.userId,"pubKey":""+this.keyval.public});
                // console.log("key:",this.keyval.public);
                this.$websocket.dispatch("StartWebsocket", [wsUrl, regisMsg])
                  .then((res) =>{
                    console.log("yyyy")



                    this.loading = false;
                    this.$router.replace({ path: "/solveRequest" });
                    this.$store
                      .dispatch("GetMyFriendList", this.$store.getters.userId)
                      .then(response => {console.log("返回啥了？",response)})
                      .catch(error => {
                        console.log(error);
                      });

                  })


                //主逻辑业务
              }
              //尝试使用RSA加密解密
              // var mingwen='VTJGc2RHVmtYMSt5RC83YXp5Rmh6RWpQYWxVVVI2YUwvRVRBZkwyZ2d4Zz0= 586343634519AA8D53652DB34123A717B7A6C53AB27744D64459C45A986D6AB85B8D857551A7361859C272711BADA8D1293A4CD418838A3925AC6956929BA28B87984A86BD4D4697724339C17AA39614589375745B1C215924178779484A1AC5AD192B859D119C31694A395617BD55A766A8625394218199113775C33511CD8C';
              // var miwen;
              // var jiemi;
              // console.log("公钥：",this.keyval.public)
              // console.log("明文:",mingwen)
              // miwen=this.encryptedData(this.keyval.public,mingwen)
              // console.log("加密后",miwen,"nnn",miwen.length)
              // jiemi=this.decodeData(this.keyval.private,miwen)
              // console.log("解密后",jiemi)


              // //
              // let regisMsg = JSON.stringify({"type" : "REGISTER","userId" : ""+this.userId,"pubKey":""+this.keyval.public});
              // console.log("key:",this.keyval.public);
              // this.$websocket.dispatch("StartWebsocket", [wsUrl, regisMsg])
              // .then((res) =>{
              //   console.log("yyyy")
              //
              //
              //
              //   this.loading = false;
              //   this.$router.replace({ path: "/solveRequest" });
              //   this.$store
              //     .dispatch("GetMyFriendList", this.$store.getters.userId)
              //     .then(response => {console.log("返回啥了？",response)})
              //     .catch(error => {
              //       console.log(error);
              //     });
              //
              // })

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

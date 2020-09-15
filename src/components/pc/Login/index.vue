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
              //const wsUrl = "wss://65.49.204.236:8081/ws"
              const wsUrl = "wss://123.56.232.247:8081/ws"
              let uid = this.userId;
              uid = "" + uid;
              console.log("那么这里的userid是多少？",this.userId)
              //开始走生成密钥和存在localstorage的步骤
              if(!window.localStorage){
                alert("浏览器不支持localstorage");
                return false;
              }else{
                // alert("支持localstorage")

                var storage=localStorage;
                // window.localStorage.removeItem('keyValue')
                // var keyval;
                console.log("yonghuid是啥:",this.userId)
                var keyname="keyValue"+this.userId;
                console.log("keyname是啥:",keyname)
                for(var i=0; i<localStorage.length;i++){
                  // console.log('第'+i+'条数据key为：'+localStorage.key(i)+',value为：'+localStorage.getItem(localStorage.key(i)));
                  if(localStorage.key(i)==keyname){
                    console.log("好像进来了")
                    this.keyval=JSON.parse(localStorage.getItem(localStorage.key(i)))
                    // if(localStorage.getItem(localStorage.key(i)!=null)){
                    //   console.log("这里呢")
                    //
                    // }
                    // else{
                    // //  如果userid 下的key是空值则删除这条记录
                    // }

                  }
                }
                //如果该userid没有key则生成并存储
                if (this.keyval==null){
                  const key = new NodeRSA({ b: 2048 }); //生成2048位的密钥
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


                //主逻辑业务
              }
              //尝试使用RSA加密解密
              // var mingwen='明文数据是这个';
              // var miwen;
              // var jiemi;
              // console.log("公钥：",this.keyval.public)
              // console.log("明文:",mingwen)
              // miwen=this.encryptedData(this.keyval.public,mingwen)
              // console.log("加密后",miwen)
              // jiemi=this.decodeData(this.keyval.private,miwen)
              // console.log("解密后",jiemi)


              //
              let regisMsg = JSON.stringify({"type" : "REGISTER","userId" : ""+this.userId,"pubKey":""+this.keyval.public});
              console.log("key:",this.keyval.public);
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

            })
            .catch(() => {
              this.loading = false;
            });
            // this.$websocket.dispatch("SendWebsocketPublicKey",[ "REGISTER",this.userId,this.keyval.public]).then((response)=>{
            // console.log("返回返回：",response)
          // })

          // this.$websocket.dispatch("REGISTER",  this.userId,keyval.public).then(
          //   (response)=>{
          //     console.log("你猜猜这里是什么？"+response)
          //   }
          // );
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

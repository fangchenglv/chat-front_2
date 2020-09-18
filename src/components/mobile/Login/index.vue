<template>
  <div class="total">
    <van-field
      v-model="username"
      left-icon="contact"
      clearable
      label="用户名"
      placeholder="请输入用户名"
      class="user-name"
    />
    <van-field
      v-model="password"
      type="password"
      label="密码"
      placeholder="请输入密码"
      left-icon="closed-eye"
      class="password"
    />
    <div id="btn">
      <van-button
        plain
        type="primary"
        class="login"
        :loading='loading'
        loading-text="登录中..."
        @click="handleLogin">登录</van-button>
      <van-button
        plain
        type="info"
        @click="gotoRegister">注册</van-button>
    </div>
  </div>
</template>

<script>
// import WebSocketClass from '../../../api/webSocket'
import {mapGetters} from 'vuex'
import {getMyFriendList} from '../../../api/friendOperation'
import NodeRSA from 'node-rsa'
import JSEncrypt from 'jsencrypt'

export default {
  name: 'login',
  data(){
    return{
      username:"",
      password:"",
      loading: false,
    };
  },
  computed:{
    ...mapGetters(["socket", "userId"]),
  },
  methods:{

    gotoRegister(){
      this.$router.push({ path: '/register' });
    },
    handleLogin(){
      if(this.username === '' || this.password == ''){
        this.$toast.fail("输入的用户名或者密码不能为空")
        return;
      }
      this.loading = true;
      this.$store
        .dispatch('Login', {'userName': this.username, 'password': this.password})
        .then(response => {
          // 连接成功https后连接websocket
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
            console.log("keyname是啥:",keyname);
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
            // let regisMsg = JSON.stringify({"userId" : ""+this.userId,"type" : "REGISTER"});
            this.$websocket.dispatch("StartWebsocket", [wsUrl, regisMsg]).then((res) =>{
              this.loading = false;
              this.$router.replace({path:'/chatList'});
              this.$store
                .dispatch("GetMyFriendList", this.$store.getters.userId)
                .then(response => {})
                .catch(error => {
                  console.log(error);
                });
            })

            }
          // let regisMsg = JSON.stringify({"userId" : ""+this.userId,"type" : "REGISTER"});
          // this.$websocket.dispatch("StartWebsocket", [wsUrl, regisMsg]).then((res) =>{
          //   this.loading = false;
          //   this.$router.replace({path:'/chatList'});
          //   this.$store
          //     .dispatch("GetMyFriendList", this.$store.getters.userId)
          //     .then(response => {})
          //     .catch(error => {
          //       console.log(error);
          //     });
          // })
        })
        .catch(() => {
          this.loading = false;
        })
    }
  }
}
</script>

<style lang="scss" scoped>
#log{
  margin: 4rem 0 0 0;
}
#btn{
  margin-top: 1rem;
}
.total{
    margin:0rem 0.5rem 0rem 0.5rem;
}
  .user-name{
    margin: 2rem 0rem 0.5rem 0rem;text-align:left;
  }
.password{
  margin: 0.5rem 0rem 0.5rem 0rem;text-align:left;
}
.login{
    margin-right:1.5rem
}
</style>

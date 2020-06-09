<template>
  <div style="margin:0rem 0.5rem 0rem 0.5rem;">
    <van-field
      v-model="username"
      left-icon="contact"
      clearable
      label="用户名"
      placeholder="请输入用户名"
      style="margin: 2rem 0rem 0.5rem 0rem;text-align:left;"
    />
    <van-field
      v-model="password"
      type="password"
      label="密码"
      placeholder="请输入密码"
      left-icon="closed-eye"
      style="margin: 0.5rem 0rem 0.5rem 0rem;text-align:left"
    />
    <div id="btn">
      <van-button 
        plain 
        type="primary" 
        style="margin-right:1.5rem"
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
import WebSocketClass from '../../../api/webSocket'
import {mapGetters} from 'vuex'
import {getMyFriendList} from '../../../api/friendOperation'

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
        // Toast.fail('输入的用户名或者密码不能为空');
        this.$toast.fail("输入的用户名或者密码不能为空")
        return;
      }
      this.loading = true;
      this.$store
        .dispatch('Login', {'userName': this.username, 'password': this.password})
        .then(response => {
          // 连接成功https后连接websocket
          // // 开发环境地址
          // const wsUrl = 'wss' + this.socket.slice(5,23) + '8081/ws';

          //产品环境地址
          const wsUrl = "wss://123.56.232.247:8081/ws"

          let regisMsg = JSON.stringify({"userId" : ""+this.userId,"type" : "REGISTER"});
          this.$websocket.dispatch("StartWebsocket", [wsUrl, regisMsg]).then((res) =>{
            // console.log("可能登录了吧", res);
            this.loading = false;
            this.$router.replace({path:'/chatList'});
            // this.$router.push({path: '/home'});
            this.$store
              .dispatch("GetMyFriendList", this.$store.getters.userId)
              .then(response => {})
              .catch(error => {
                console.log(error);
              });
          })
        })
        .catch(() => {
          this.loading = false;
        })
    }
  }
}
</script>

<style scoped>
#log{
  margin: 4rem 0 0 0;
}
#btn{
  margin-top: 1rem;
}

</style>
<template>
  <div class="register-total">
    <van-field
      v-model="username"
      required
      label="用户名"
      placeholder="请输入用户名"
      class="user-name"
    />
    <van-field
      v-model="password"
      required
      type="password"
      label="密码"
      placeholder="请输入密码"
      :error-message="errorPass"
      class="user"
    />
    <van-field
      v-model="checkPass"
      required
      type="password"
      label="确认密码"
      placeholder="请确认您的密码"
      class="user"
    />
    <van-field
      required
      v-model="nickname"
      label="昵称"
      placeholder="请输入昵称"
      class="user"
    />
    <van-radio-group v-model="gender" >
      <van-cell >性别</van-cell>
      <van-cell-group >
        <div class="man" >
          <van-cell title="男性" clickable @click="gender = '1'" >
            <van-radio slot="right-icon" name="1"/>
          </van-cell>
        </div>
        <div class="woman">
          <van-cell title="女性" clickable @click="gender = '2'">
            <van-radio slot="right-icon" name="2" />
          </van-cell>
        </div>
      </van-cell-group>
    </van-radio-group>
    <van-field
      required
      v-model="email"
      label="邮箱"
      placeholder="请输入邮箱地址"
      class="user"
      :error-message="errorEmail"
    />
    <van-field
      required
      v-model="phone"
      label="电话"
      placeholder="请输入电话号码"
      class="user"
      :error-message="errorPhone"
    />
    <div >
      <van-button
        plain
        type="primary"
        class="reg"
        :loading='loading'
        @click="handleResgister">注册</van-button>
      <van-button
        plain
        type="info"
        class="login"
        @click="gotoLogin">登录</van-button>
    </div>
  </div>
</template>

<script>
import {register} from '../../../api/login'
import {isvalidPhoneNumber, isvalidEmail} from "../../../utils/validate"


export default {
  name:'register',
  data(){
    return{
      username: '',
      password: '',
      checkPass: '',
      nickname: '',
      gender: '',
      email: '',
      phone: '',
      loading: false,
      errorPass: '',
      errorEmail:"",
      errorPhone:"",
    }
  },
  methods:{
    gotoLogin(){
      this.$router.push({path:'/login'});
    },
    handleResgister(){
      if(this.username === '' || this.password === '' || this.checkPass === '' || this.nickname === '' || this.gender === '' || this.email === '' || this.phone === ''){
        this.$toast.fail("输入的注册信息不能有空");
        return;
      }
      if(this.password !== this.checkPass){
        this.errorPass = "两次密码输入值不同，请重新输入";
        this.password = '';
        this.checkPass = '';
        return
      }
      if(!isvalidPhoneNumber(this.phone)){
        this.errorPhone = "输入的电话号码格式错误，请重新输入";
        this.phone = '';
        return
      }
      if(!isvalidEmail(this.email)){
        this.errorEmail = "输入的邮箱地址不正确，请重新输入";
        this.email = ''
        return
      }
      this.errorPhone = '';
      this.errorPass = '';
      this.errorEmail = '';
      this.loading = true;
      register(
        this.username.trim(),
        this.password.trim(),
        this.nickname.trim(),
        this.gender.trim(),
        this.email.trim(),
        this.phone.trim()
      )
      .then(response => {
        if (response.data.status === "success") {
          this.$toast.success("注册成功");
          this.loading = false;
          this.$router.push({ path: "/login" });
        }
      })
      .catch(error => {
        this.loading = false;
        console.log("!!!!!!!!!!!!!!!!!!!!", error);
      });
    }
  }
}
</script>

<style lang="scss" scoped>
.register-total{
  margin-left:0.5rem; margin-right:0.5rem
}
  .user-name{
    margin: 1rem 0rem 0.5rem 0rem; text-align:left
  }
  .user{
    margin: 0rem 0rem 0.5rem 0rem; text-align:left
  }
  .van-radio-group{
    margin: 0rem 0rem 0.5rem 0rem;
    /*text-align:left*/
  }
  .van-cell-group{
    text-align:center;
  }
  .man{
    display:inline-block;
    margin-right:1rem
  }
  .woman{
    display:inline-block;
  }
  .van-radio{
    padding-left:0.3rem
  }
.reg{margin-right:1rem}
.login{margin-left:1rem}
</style>

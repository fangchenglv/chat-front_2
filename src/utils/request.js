import Vue from 'vue'
import axios from "axios"
import store from "@/stores"
import {
  Message,
  MessageBox
} from "element-ui"
import { Toast } from 'vant'
import 'vant/lib/index.css'
import Vant from '../../src/utils/vant'

//创建的axios实例，虽然是在这里创建实例，
//但是前后台交互的部分却在api里面重新定义了交互函数，而实现又去了store里面具体实现
//这里的主要作用就是负责拦截请求判断
const service = axios.create({
  baseURL: process.env.BASE_API,
  timeout: 15000,
})

// request的拦截器

// response的拦截器
// 判断登录时用户是否正确以及注册时是否重复注册
service.interceptors.response.use(
  response => {
    const status = response.data.status;

    // 统一的返回拦截
    if (status === "fail") {
      // console.log('!!!!!!!!!!!!!!!!!!!!!!!', response);
      const errorMsg = response.data.data.errMsg;
      if(/Android|iPhone|SymbianOS|iPad|iPod/i.test(navigator.userAgent)){
        console.log("来了来了");
        // this.$toast.fail(errorMsg).then(() => {
        //   location.reload();
        // });
        Toast(errorMsg);
        location.reload();
      }else{
        MessageBox.confirm(errorMsg, "提示信息", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }).then(() => {
          location.reload();
        })
      }
      
      return
    }
    // 登录的返回拦截
    // console.log('??????????????????????????????????????????', response);
    // if (status !== "success") {
    //   MessageBox.confirm("用户名或者密码错误，请重新登录", "重新登录", {
    //     confirmButtonText: "重新登录",
    //     cancelButtonText: "取消",
    //     type: "warning"
    //   }).then(() => { //FedLogOut登出函数
    //     location.reload()
    //     // store.dispatch("FedLogOut").then(() => {
    //     //   location.reload()
    //     // })
    //   })
    //   return Promise.reject(error)
    // }
    // 最终返回正确的返回response数据
    return response
  },
  error => {
    if(/Android|iPhone|SymbianOS|iPad|iPod/i.test(navigator.userAgent)){
      Toast(errorMsg);
    }
    else{
      Message({
        message: error.message,
        type: "error",
        duration: 10000,
      })
    }
    return Promise.reject(error);
  }
)

// 对外接口
export default service

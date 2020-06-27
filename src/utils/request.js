import axios from "axios"
import store from "@/stores"
import {
  Message,
  MessageBox
} from "element-ui"
import { Toast } from 'vant'
import 'vant/lib/index.css'

//创建的axios实例，虽然是在这里创建实例，
//但是前后台交互的部分却在api里面重新定义了交互函数，而实现又去了store里面具体实现
//这里的主要作用就是负责拦截请求判断
const service = axios.create({
  baseURL: process.env.BASE_API,
  timeout: 15000,
})

// request的拦截器
service.interceptors.request.use(
  config => {
    // console.log("#####################", store.getters.tok)
    if (store.state.tok !== null) {
      config.headers.token = store.getters.tok;
    }
    return config;
  },
  error => {
    //对请求错误做什么
    return Promise.reject(error);
  }
)

// response的拦截器
// 判断登录时用户是否正确以及注册时是否重复注册
service.interceptors.response.use(
  response => {
    const status = response.data.status;
    if(!store.getters.tok){
      store.commit("UPDATE_TOKEN", response.headers.authorization);
    }
    
    // 统一的返回拦截
    if (status === "fail") {
      const errorMsg = response.data.data.errMsg;
      if(/Android|iPhone|SymbianOS|iPad|iPod/i.test(navigator.userAgent)){
        // console.log("来了来了");
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
    return response
  },
  error => {
    if(store.getters.tok !== null){
      store.commit("DELETE_TOKEN", null);
    } else {
      if (/Android|iPhone|SymbianOS|iPad|iPod/i.test(navigator.userAgent)) {
        Toast(errorMsg);
      } else {
        Message({
          message: error.message,
          type: "error",
          duration: 1000,
        })
      }
      return Promise.reject(error);
    }
  }
)

// 对外接口
export default service

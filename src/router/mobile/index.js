import Vue from 'vue'
import Router from 'vue-router'
import Loginer from '../../components/mobile/Login/index'

Vue.use(Router)

let router = new Router({
  routes: [
    //登录页
    {
      path:'/login',
      component:Loginer,
      meta:{
        keepAlive:false,
      }
    },
    //注册页
    {
      path:'/register',
      component:() => import('../../components/mobile/Register/index.vue'),
      meta:{
        keepAlive:false,
      }
    },
    // //登录主页
    // {
    //   path:'/home',
    //   component:() => import('../../components/mobile/Home/index.vue'),
    //   meta:{
    //     keepAlive:true,
    //   }
    // },
    //聊天保存页
    {
      path:'/chatList',
      component:() => import('../../components/mobile/ChatList/index.vue'),
      meta:{
        keepAlive:true,
      }
    },
    //好友操作页
    {
      path:'/friendOperation',
      component:() => import('../../components/mobile/FriendOperation/index.vue'),
      meta:{
        keepAlive:true,
      }
    },
    //好友列表页
    {
      path:'/friendList',
      component:() => import('../../components/mobile/FriendList/index.vue'),
      meta:{
        keepAlive:true,
      }
    },
    //个人主页
    {
      path:'/personalPage',
      component:() => import('../../components/mobile/PersonalPage/index.vue'),
      meta:{
        keepAlive: true,
      }
    },
    //重定向
    {
      path: '/*',
      redirect: '/login',
    }
  ]
})

router.beforeEach((to, from, next) => {
  if(!/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)){
    window.location.href = '/p_index.html#/'
    // top.location.href = '/p_index.html'
    // next()
    return
  }
  // next({path:'/login'})
  next()
})

export default router
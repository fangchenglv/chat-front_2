import Vue from 'vue'
import Router from 'vue-router'
import loginRouter from '../../components/pc/Login/index'

Vue.use(Router)

let router = new Router({
  routes: [
    //登录页
    {
      path: '/login',
      component: loginRouter,
      meta:{
        keepAlive: false,
      }
    },
    //注册页
    {
      path: '/register',
      component: () => import("../../components/pc/Register/index.vue"),
      meta:{
        keepAlive:false,
      }
    },
    //home页
    {
      path: '/home',
      component:() => import('../../components/pc/Home/index.vue'),
      meta:{
        keepAlive: true,
      }
    },
    //重定向
    {
      path:'/*',
      redirect:'/login',
    }
  ]
})

router.beforeEach((to, from, next) => {
  if(/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)){
    window.location.href = '/m_index.html#/'
    // top.location.href = '/m_index.html'
    // next()
    return
  }
  // next({path:'/login'})
  next()
})

export default router

import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/pc/helloworld'

Vue.use(Router)

let router = new Router({
  routes: [
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    }
  ]
})

router.beforeEach((to, from, next) => {
  if(/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)){
    window.location.href = '/m_index.html#/'
    return
  }
  next()
})

export default router

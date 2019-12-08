import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/mobile/helloworld'

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
  if(!/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent)){
    window.location.href = '/p_index.html#/'
    return
  }
  next()
})

export default router
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
    //新建好友分组
    {
      path:'/newFriendGroup',
      component:() => import('../../components/pc/LeftSide/NewFriendGroup/index.vue'),
      meta:{
        keepAlive:true,
      }
    },
    //删除好友分组
    {
      path: "/deleteFriendGroup",
      component: () => import("../../components/pc/LeftSide/DeleteFriendGroup/index"),
      meta:{
        keepAlive:true,
      }
    },
    //新建群聊
    {
      path:'/newGroupChat',
      component:() => import("../../components/pc/LeftSide/newGroupChat/index.vue"),
      meta:{
        keepAlive:true,
      }
    },
    //进入指定群聊页
    {
      path:"/groupChat/:groupNum",
      name:"groupChat",
      component:() => import("../../components/pc/GroupChat/index.vue"),
      meta:{
        keepAlive:true,
      }
    },
    //具体的群聊里面
    {
      path: "/groupChatPage/:groupId/:myId/:name",
      name:"groupChatPage",
      component:() => import("../../components/pc/groupChatPage/index.vue"),
      meta:{
        keepAlive:true,
      }
    },
    //添加新好友
    {
      path:'/requestFriend',
      component:() => import('../../components/pc/LeftSide/NewFriend/index.vue'),
      meta:{
        keepAlive:true,
      },
      children:[
        {
          path:'result',
          component:() => import('../../components/pc/LeftSide/NewFriend/result.vue'),
          meta:{
            keepAlive:true,
          }
        }
      ]
    },
    //查询好友申请并处理
    {
      path:'/solveRequest',
      component:() => import('../../components/pc/LeftSide/FriendRequest/index.vue'),
      meta:{
        keepAlive:true,
      }
    },
    //查询历史好友请求
    {
      path:'/acceptRejectFriend',
      component:() => import("../../components/pc/LeftSide/HistoryFriend/index.vue"),
      meta:{
        keepAlive:true,
      }
    },
    //好友列表
    {
      name:'friendList',
      path:"/friendList/:groupId",
      component:() => import("../../components/pc/MyFriendList/index.vue"),
      meta:{
        keepAlive:true,
      }
    },
    //好友聊天室
    {
      name: 'privateChatRoom',
      path:"/privateChatRoom/:friendId/:name/:avatar",
      component:() => import('../../components/pc/PrivateChatRoom/index.vue'),
      meta:{
        keepAlive:true,
      }
    },
    //好友聊天历史记录
    {
      path:"/privateHistoryPage/:toId/:fromId",
      name:"privateHistoryPage",
      component:() => import("../../components/pc/HistoryRecord/index.vue"),
      meta:{
        keepAlive:true,
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

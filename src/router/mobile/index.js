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
      },
    },
    {
      path: "/changeFriendGroup/:friendId",
      name: "changeFriendGroup",
      component:() => import("../../components/mobile/FriendList/FriendPage/changeFriendGroup"),
      meta:{
        keepAlive:false,
      }
    },
    //新建好友分组
    {
      path:'/newFriendGroup',
      component:() => import('../../components/mobile/FriendOperation/NewGroup/index.vue'),
      meta:{
        keepAlive:false,
      }
    },
    //修改好友分组
    {
      path: "/changeFriendGroup",
      component:() => import("../../components/mobile/FriendOperation/ChangeFriendGroup/index"),
      meta:{
        keepAlive:false,
      }
    },
    //申请添加新的好友
    {
      path:"/newFriend",
      component:() => import("../../components/mobile/FriendOperation/NewFriend/index.vue"),
      meta:{
        keepAlive:false,
      },
      children:[{
        path:"result",
        component:() => import("../../components/mobile/FriendOperation/NewFriend/result.vue"),
        meta:{
          keepAlive:false,
        }
      }]
    },
    //处理发送过来的好友请求
    {
      path:'/ReselveFriendRequset',
      component:() => import("../../components/mobile/FriendOperation/ReselveRequest/index.vue"),
      meta:{
        keepAlive:false,
      }
    },
    //查看历史好友处理情况
    {
      path: "/historyFriend",
      component:() => import("../../components/mobile/FriendOperation/HistoryRequest/index.vue"),
      meta:{
        keepAlive:false,
      }
    },
    //新建群聊
    {
      path: "/newGroupChat",
      component:() => import("../../components/mobile/FriendOperation/NewGroupChat/index.vue"),
      meta:{
        keepAlive:false,
      }
    },
    //进入具体的群聊页
    {
      path: "/groupChatPage/:groupId/:myId/:name",
      name: "groupChatPage",
      component: () => import("../../components/mobile/groupChatPage/index"),
      meta:{
        keepAlive:false,
      }
    },
    //某群聊信息页
    {
      path: "/groupChat/:groupNum",
      name: "groupChat",
      component:() => import("../../components/mobile/GroupChat/index"),
      meta:{
        keepAlive:false,
      },
    },
    //修改群名片
    {
      path: "/groupChat/:groupNum/newMessage",
      name: "newMessage",
      component: () => import("../../components/mobile/GroupChat/newGroupMessage"),
      meta: {
        keepAlive: false,
      }
    },
    //添加新的群成员
    {
      path: "/groupChat/:groupNum/:groupId/newGroupChatMember",
      name: "newGroupChatMember",
      component:() => import("../../components/mobile/GroupChat/newGroupChatMember"),
      meta:{
        keepAlive:false,
      }
    },
    //查看群成员
    {
      path: "/checkGroupFriend/:groupId",
      name: "checkGroupFriend",
      component: () => import("../../components/mobile/GroupChat/checkGroupFriend"),
      meta: {
        keepAlive:false,
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
    //好友个人主页
    {
      path:"/friendPage/:id",
      name:"FriendPage",
      component:() => import("../../components/mobile/FriendList/FriendPage/index.vue"),
      meta:{
        keepAlive:false,
      }
    },
    //私人聊天主页
    {
      name: 'privateChatRoom',
      path:"/privateChatRoom/:friendId/:name/",
      component:() => import('../../components/mobile/PrivateChatRoom/index.vue'),
      meta:{
        keepAlive:false,
      }
    },
    //好友聊天历史记录
    {
      path:"/privateHistoryPage/:toId/:fromId",
      name:"privateHistoryPage",
      component:() => import("../../components/mobile/HistoryRecord/index.vue"),
      meta:{
        keepAlive:false,
      }
    },
    //群聊历史记录
    {
      path: "groupHistoryPage/:id",
      name: "groupHistoryPage",
      component: () => import("../../components/mobile/HistoryRecord/groupHistoryRecord/index"),
      meta: {
        keepAlive: false,
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
    return
  }
  next()
})

export default router
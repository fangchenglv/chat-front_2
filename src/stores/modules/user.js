import {
  login,
  register //请求参数有这么多(userName, password, nickname, gender, email, phone, roleCode)
} from "../../api/login.js";
import {
  searchFriend,
  getMyFriendList,
  getUnreadMsgList,
} from "../../api/friendOperation.js";
import service from "@/utils/request";
import {
  resolve
} from "path";

const user = {
  state: {
    // userName: "",
    userId: -1,
    userRole: -1,
    userSign: "",
    userNickname: "",
    userName: "",
    beSearchFriend: [],
    // toSearchMe: [],
    myFriendList: [],
    socket : process.env.BASE_API,
    userAvatar:"",
    unreadList:[],
  },
  mutations: {
    SET_USERID: (state, id) => {
      state.userId = id;
    },
    SET_USERROLE(state, role) {
      state.userRole = role;
    },
    SET_USERSIGN(state, sign) {
      state.userSign = sign;
    },
    SET_USERNICKNAME(state, nick) {
      state.userNickname = nick;
    },
    SET_USERNAME(state, name) {
      state.userName = name;
    },
    SET_SEARCHFRIEND(state, name) {
      state.beSearchFriend = name;
    },
    // SET_TOSEARCHME(state, name) {
    //   state.toSearchMe = name;
    // },
    SET_MYFRIENDLIST(state, name) {
      state.myFriendList = name;
    },
    SET_USERAVATAR(state, avatar){
      state.userAvatar = avatar;
    },
    SET_UNREADLIST(state, list){
      state.unreadList = list;
    },
    // UPDATE_WEBSOCKET(state, sock){
    //   state.socket = sock;
    // },
  },
  actions: {
    //保存后台地址
    // priserveUrl({commit}, str){
    //   commit("UPDATE_WEBSOCKET", str);
    // },
    // 登录,同时连接上websocket并保持连接状态
    Login({
      commit
    }, userInfo) {
      //userInfo是页面传入的表单数据
      const name = userInfo.userName.trim();
      const pass = userInfo.password.trim();
      return new Promise((resolve, reject) => {
        //login是分装了axios请求的,axios请求也是Promise对象
        login(name, pass)
          .then(response => {
            const data = response.data.data; //是接口返回的参数
            // console.log('!!!!!!!!!!!!!!!!!!!!!', data)
            // console.log('!!!!!!!!!!!!!', data.id)
            // const wssUrl = 'wss://10.112.48.143:8890/chat/' + data.id
            // console.log(wssUrl)
            commit("SET_USERID", data.id);
            commit("SET_USERROLE", data.userRole);
            commit("SET_USERSIGN", data.userSign);
            commit("SET_USERNICKNAME", data.nickName);
            commit("SET_USERNAME", data.userName);
            commit("SET_USERAVATAR", data.avatar)
            // commit('UPDATE_WEBSOCKET', new WebSocket(wssUrl));
            resolve(response);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    //得到自己的好友列表
    GetMyFriendList({
      commit
    }, id) {
      return new Promise((resolve, reject) => {
        getMyFriendList(id)
          .then(response => {
            const data = response.data.data;
            commit("SET_MYFRIENDLIST", data);
            resolve(response);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    //得到离线消息列表
    GetUnreadMsgList({commit}, id){
      return new Promise((resolve, reject) => {
        getUnreadMsgList(id).then(response =>{
          const data = response.data.data;
          // console.log(data);
          commit("SET_UNREADLIST", data);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        })
      })
    },
    // //删除自己的某位好友并且更新自己保存的好友列表
    // DeleteMyFriend({
    //   commit
    // }, myId, friendId) {
    //   return new Promise((resolve, reject) => {
    //     deleteMyFriend(myId, friendId).then(response => {
    //       resolve(response);
    //     }).catch(error => {
    //       reject(error);
    //     })
    //   })
    // },
    //申请添加好友时的寻找好友
    SearchFriend({
      commit
    }, info) {
      //Info是传入的searchStr
      return new Promise((resolve, reject) => {
        //login是分装了axios请求的，所以运行结构是axios的也就是promise的
        searchFriend(info)
          .then(response => {
            const data = response.data.data; //是接口返回的参数
            commit("SET_SEARCHFRIEND", data);
            resolve(response);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    //查看申请添加自己为好友的用户信息的请求
    // SearchFriendRequest({
    //   commit
    // }, id, code, pageNum, pageSize) {
    //   return new Promise((resolve, reject) => {
    //     searchFriendRequest(id, code, pageNum, pageSize)
    //       .then(response => {
    //         const data = response.data.data.list;
    //         // const data = response;
    //         commit("SET_TOSEARCHME", data);
    //         resolve(response);
    //       })
    //       .catch(error => {
    //         reject(error);
    //       });
    //   });
    // },
    //注册
    Register(userRegisInfo) {
      console.log(typeof userRegisInfo.userName);
      const userName = userRegisInfo.userName.trim();
      const password = userRegisInfo.password.trim();
      const nickname = userRegisInfo.nickname.trim();
      const gender = userRegisInfo.gender.trim();
      const email = userRegisInfo.email.trim();
      const phone = userRegisInfo.phone.trim();
      // const roleCode = userRegisInfo.roleCode.trim()

      return new Promise((resolve, reject) => {
        register(userName, password, nickname, gender, email, phone)
          .then(response => {
            const data = response.data;
            resolve(response);
          })
          .catch(error => {
            reject(error);
          });
      });
    }
  }
};
export default user;

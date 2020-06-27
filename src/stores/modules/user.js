import {
  login,
  register 
} from "../../api/login.js";
import {
  searchFriend,
  getMyFriendList,
  getUnreadMsgList,
  getMyGroupChatPerson,
  getMyGroupList,
} from "../../api/friendOperation.js";

const user = {
  state: {
    userId: -1,
    userRole: -1,
    userSign: "",
    userNickname: "",
    userName: "",
    beSearchFriend: [],
    myFriendList: [],
    allFriend:[],
    socket : process.env.BASE_API,
    userAvatar:"",
    unreadList:[],
    myGroupChat:[],
    myGroupFriends: {},
    leaveMessage:[]
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
    SET_MYFRIENDLIST(state, name) {
      state.myFriendList = name;
    },
    SET_USERAVATAR(state, avatar){
      state.userAvatar = avatar;
    },
    SET_UNREADLIST(state, list){
      state.unreadList = list;
    },
    SET_ALLFRIEND(state, list){
      state.allFriend = list;
    },
    SET_MYGROUPCHAT(state, data){
      state.myGroupChat = data;
    },
    SET_GROUPFRIENDS(state, data){
      state.myGroupFriends[data[1]] = data[0];
    },
    SET_LEAVEMSG(state, data){
      state.leaveMessage = data;
    }
  },
  actions: {
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
            // console.log("@@@@@@@@@@@@@@@@@@@@@", data);
            commit("SET_USERID", data.id);
            commit("SET_USERROLE", data.userRole);
            commit("SET_USERSIGN", data.userSign);
            commit("SET_USERNICKNAME", data.nickName);
            commit("SET_USERNAME", data.userName);
            commit("SET_USERAVATAR", data.avatar)
            // commit('UPDATE_WEBSOCKET', new WebSocket(wssUrl));
            getUnreadMsgList(data.id).then(res => {
              commit("SET_LEAVEMSG", res.data.data);
            })
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
          let allFriend = [];
          for(let i = 0; i < data.length; i++){
            for(let j = 0; j < data[i].friends.length; j++){
              allFriend.push(data[i].friends[j]);
            }
          }
          commit("SET_ALLFRIEND", allFriend);
          // console.log("整形后的全部好友",allFriend);
          resolve(response);
        })
        .catch(error => {
          reject(error);
        });
      });
    },
    //得到好友列表的整形数据
    GetAllFriend({commit}, data){
      commit("SET_MYFRIENDLIST", data);
      let allFriend = [];
      for(let i = 0; i < data.length; i++){
        for(let j = 0; j < data[i].friends.length; j++){
          allFriend.push(data[i].friends[j]);
        }
      }
      commit("SET_ALLFRIEND", allFriend);
    },
    //得到自己的群组
    GetMyGroupList({commit}, id){
      getMyGroupList(id).then(res => {
        commit("SET_MYGROUPCHAT", res.data.data);
        // console.log("全部群组列表", res.data.data);
      })
    },
    //得到自己加的群聊的详细数据
    GetMyGroupChat({commit}, data){
      commit("SET_MYGROUPCHAT", data);
      let result = {};
      for(let i = 0; i < data.length; i++){
        getMyGroupChatPerson(data[i].id).then((res) => {
          // console.log("取群成员",  res.data.data);
          let oldGroupFriend = res.data.data
          for (let i = 0; i < oldGroupFriend.length; i++) {
            let tmp = {
              friendId: oldGroupFriend[i].user.id,
              friendName: oldGroupFriend[i].user.nickName,
              friendAvatar: oldGroupFriend[i].user.avatar
            }
            result["" + oldGroupFriend[i].user.id] = tmp
          }
          commit("SET_GROUPFRIENDS", [result, data[i].id])
        })
      }
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
    },
  }
};
export default user;

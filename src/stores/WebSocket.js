import Vue from 'vue'
import Vuex from 'vuex'
import { Toast } from 'vant'
import { Message } from 'element-ui'
import createPersistedState from "vuex-persistedstate"

Vue.use(Vuex)

export default new Vuex.Store({
  state:{
    websock: null,
    regisMsg: "",
    privateMessage: new Array(),
    privateUnreadNumber: new Array(),
    groupMessage: new Array(),
    groupUnreadNumber: new Array(),
    currentFriendId:-1,
    currendGroupId:-1,
  },
  getters:{
    privateMessage:state => id => {
      return state.privateMessage[id];
    },
    groupMessage: state => id => {
      return state.groupMessage[id];
    }
  },
  mutations:{
    SET_WEBSOCKET(state, sock){
      state.websock = sock;
    },
    SET_REGISTERMSG(state, regisMsg){
      state.regisMsg = regisMsg;
    },
    WEBSOCKET_INIT(state, data){
      let [url, regisMsg] = data
      
      // console.log(regisMsg, state.regisMsg);
      state.websock.onopen = function () {
        if (state.regisMsg !== undefined && state.websock.readyState === 1) {
          state.websock.send(state.regisMsg);
          // commit("WEBSOCKET_ONMESSAGE")
          // this.WEBSOCKET_ONMESSAGE()
        }
      }
      state.websock.οnerrοr = function (e) { //错误
        console.log("ws错误!");
        console.log(e);
      }
      state.websock.onclose = function (e) { //关闭
        console.log("ws关闭！");
        console.log(e);
      }
      //保活
      setInterval(() => {
        if (state.websock.readyState === 1) {
          state.websock.send(state.regisMsg);
          // console.log('发送心跳信息ping');
        }
      }, 30000)
    },
    WEBSOCKET_ONMESSAGE(state, data){
      state.websock.onmessage = function (e) {
        console.log("这是在websocket里面");
        let data = JSON.parse(e.data);
        if (data.status === 200) {
          //单聊信息
          if (data.data.type === "SINGLE_SENDING" || data.data.type === "SINGLE_SENDING_IMG" || data.data.type === "FILE_MSG_SINGLE_SENDING") {
            // console.log("数据变化前", state.privateMessage);
            // console.log("有没有包含到底", state.privateMessage.count())
            console.log("websocket走这儿吗", state.privateMessage.find((val, ind) => ind == data.data.fromUserId))
            let friendId = parseInt(data.data.fromUserId);
            if (state.privateMessage.find((val, ind) => ind == friendId) != null || state.privateMessage.find((val, ind) => ind == friendId) != undefined) {
              state.privateMessage[friendId].push(data.data);
              state.privateUnreadNumber[friendId] = state.privateUnreadNumber[friendId] + 1;
            } else {
              state.privateMessage[friendId] = [data.data];
              state.privateUnreadNumber[friendId] = +1;
            }
            // console.log("数据变化后", state.privateMessage);
            // console.log("有没有包含到底", state.privateMessage.count())
            if (/Android|iPhone|SymbianOS|iPad|iPod/i.test(navigator.userAgent)) {
              Toast({
                message: "新的好友信息，请注意查看",
                position: "top"
              });
            } else {
              Message("新的好友信息，请注意查看");
            }
          }
          //群聊信息
          if (data.data.type === "GROUP_SENDING" || data.data.type === "GROUP_SENDING_IMG" || data.data.type === "FILE_MSG_GROUP_SENDING") {
            //仿照单聊信息实现
            console.log("未进入群聊信息的提醒", state.groupUnreadNumber)
            let GroupId = parseInt(data.data.toGroupId);
            console.log("!!!!@@@", state.groupUnreadNumber)
            if (state.groupMessage.find((val, ind) => ind === GroupId) != null || state.groupMessage.find((val, ind) => ind === GroupId) != undefined) {
              state.groupMessage[GroupId].push(data.data);
              state.groupUnreadNumber[GroupId] = state.groupUnreadNumber[GroupId] + 1
            } else {
              state.groupMessage[GroupId] = [data.data];
              state.groupUnreadNumber[GroupId] = 1;
            }
            if (/Android|iPhone|SymbianOS|iPad|iPod/i.test(navigator.userAgent)) {
              Toast({
                message: "新的群信息，请注意查看",
                position: "top"
              });
            } else {
              Message("新的群信息，请注意查看");
            }
          }
        } else {
          state.websock.send(state.regisMsg);
        }
      }
    },
    SEND_NAME(state, name){
      state.websock.send('fileName:' + name)
    },
    SEND_FILE(state, file){
      state.websock.send(file)
    },
    GET_BUFFEREDAMOUNT(state){
      return state.websock.bufferedAmount
    },
    WEBSOCKET_SEND(state, data) {
      let id = data[1];
      // console.log("!!!!", state.currendGroupId, this.state.currentFriendId)
      // if (state.privateMessage.has(id)) {
      if (state.currentFriendId !== -1) {
        if (state.privateMessage.find((val, ind) => {
            return ind === id;
          })) {
          state.privateMessage[id].push(JSON.parse(data[0]));
        } else {
          state.privateMessage[id] = [JSON.parse(data[0])];
        }
        state.websock.send(data[0]);
        console.log("ws发送！", data[0]);
      }
      if (state.currendGroupId !== -1) {
        console.log("应该发东西", data[0])
        if (state.groupMessage.find((val, ind) => {
            return ind === id;
          })) {
          state.groupMessage[id].push(JSON.parse(data[0]));
        } else {
          state.groupMessage[id] = [JSON.parse(data[0])];
        }
        state.websock.send(data[0]);
        console.log("ws发送！", data[0]);
      }
      // console.log("信息发送出去以后", state.privateMessage)
    },
    WEBSOCKET_FRIENDID(state, id){
      if(state.currendGroupId !== -1){
        state.currendGroupId = -1;
      }
      state.currentFriendId = id;
    },
    WEBSOCKET_GROUPID(state, id){
      if(state.currentFriendId !== -1){
        state.currentFriendId = -1
      }
      state.currendGroupId = id;
    }
  },
  actions:{
    StartWebsocket({
      commit
    }, msg) {
      let [url, regisMsg] = msg;
      let web = new WebSocket(""+url);
      commit("SET_WEBSOCKET", web);
      commit("SET_REGISTERMSG", regisMsg);
      commit('WEBSOCKET_INIT', msg);
      commit("WEBSOCKET_ONMESSAGE")
    },
    SendWebsocketMessage({
      commit
    }, data) {
      // console.log(data);
      commit('WEBSOCKET_SEND', data)
    },
    SendWebsocketFileName({
      commit
    }, name){
      commit("SEND_NAME", name)
    },
    SendWebsocketFileMessage({
      commit
    }, data){
      commit("SEND_FILE", data)
    },
    GetBufferedAmount({commit}){
      let data = commit("GET_BUFFEREDAMOUNT")
      return data
    },
    StartChatId({commit},data){
      // console.log(data);
      if (data[1] === "private") {
        commit("WEBSOCKET_FRIENDID", data[0]);
      } else {
        commit("WEBSOCKET_GROUPID", data[0]);
      }
    },
    StopChatId({commit, state}){
      // console.log("销毁页面以后是否提交之前的聊天", state.privateMessage)
      commit("WEBSOCKET_FRIENDID", -1);
      commit("WEBSOCKET_GROUPID", -1);
      commit("WEBSOCKET_ONMESSAGE");
      console.log("执行到这句了")
    }
  },
  plugins: [new createPersistedState({
    storage: window.sessionStorage,
  })]
})

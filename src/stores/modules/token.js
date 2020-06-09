import mRouter from "../../router/mobile/index"
import pRouter from "../../router/pc/index"

const token = {
  state: {
    tok: null,
  },

  mutations: {
    UPDATE_TOKEN(state, sock) {
      if (sock) {
        if (state.tok !== null) {
          // console.log("!!!!!!!!!!!!!!!!!!!!!有token值")
          return;
        } else {
          state.tok = sock;
        }
      } else {
        // console.log("@@@@@@@@@@@@@@@@@没有有token值")
        this.$router.replace("/login");
      }
      
    },
    DELETE_TOKEN(state){
      state.tok = null
      if (/Android|iPhone|SymbianOS|iPad|iPod/i.test(navigator.userAgent)) {
        mRouter.replace("/login")
      }
      else {
        pRouter.replace("/login")
      }
    }
  },

  // actions: {
  //   StartWebsocket({
  //     commit
  //   }, msg) {
  //     let url = msg[0]
  //     let name = msg[1]
  //     let regisMsg = msg[2]
  //     commit('UPDATE_WEBSOCKET', new WebSocketClass(url, name, regisMsg));
  //   },
  //   getPrivateMessage({
  //     commit
  //   }, data) {
  //     commit("UPDATE_PRIVATEMESSAGE", data);
  //   },
  //   getGroupMessage({
  //     commit
  //   }, data) {
  //     commit("UPDATE_GROUPMESSAGE", data);
  //   }
  // }
};
export default token
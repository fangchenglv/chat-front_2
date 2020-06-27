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
          return;
        } else {
          state.tok = sock;
        }
      } else {
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
};
export default token
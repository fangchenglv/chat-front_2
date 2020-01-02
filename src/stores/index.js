import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import websock from './modules/websock'
import getters from './getters'
import createPersistedState from "vuex-persistedstate"


Vue.use(Vuex)

const store = new Vuex.Store({
    modules: {
      user,
      websock,
    },
    getters,
    plugins: [new createPersistedState({
      storage: window.sessionStorage,
    })]
  }

)
export default store

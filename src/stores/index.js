import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import getters from './getters'
import createPersistedState from "vuex-persistedstate"
import token from "./modules/token";


Vue.use(Vuex)

const store = new Vuex.Store({
    modules: {
      user,
      token,
    },
    getters,
    plugins: [new createPersistedState({
      storage: window.sessionStorage,
    })]
  }

)
export default store

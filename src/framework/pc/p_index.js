// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from '@/router/pc/index'
//使用element-ui
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
//使用axios
import axios from 'axios'
import VueAxios from 'vue-axios'
//使用Vuex
import Vuex from 'vuex'
import store from '@/stores'
import "lib-flexible/flexible"

import Websocket from "../../stores/WebSocket";


Vue.use(ElementUI)
Vue.use(VueAxios, axios)
Vue.use(Vuex)
Vue.prototype.$websocket = Websocket

Vue.config.productionTip = false



/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

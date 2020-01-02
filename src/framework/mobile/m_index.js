// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from '@/router/mobile/index'
//更改根字体的设置
import "lib-flexible/flexible"
//使用axios
import axios from 'axios'
import VueAxios from 'vue-axios'
//使用vuex
import Vuex from 'vuex'
import store from '@/stores'
import FastClick from 'fastclick'

//按需使用vantUi,主文件导入全部使用的组件
import '../../utils/vant'

Vue.use(VueAxios, axios)
Vue.use(Vuex)

Vue.config.productionTip = false
FastClick.attach(document.body)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

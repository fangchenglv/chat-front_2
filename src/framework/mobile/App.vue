<template>
  <div id="app">
    <div v-if="$route.meta.keepAlive" style="height:100%">
      <keep-alive>
        <BaseStruct></BaseStruct>
      </keep-alive>
    </div>
    <router-view v-if="!$route.meta.keepAlive"/>
  </div>
</template>

<script>
import BaseStruct from '@/components/mobile/BaseStruct/index'

export default {
  name: 'App',
  components:{
    BaseStruct,
  }
}
</script>

<style>
html,body,#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align:center;
  color: #2c3e50;
  margin-top: 0rem;
  /* height: 100%; */
  background-color:whitesmoke;
}
</style>

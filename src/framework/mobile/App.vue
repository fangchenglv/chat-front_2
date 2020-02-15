<template>
  <div id="app">
    <div v-if="$route.meta.keepAlive">
      <!-- <router-view></router-view> -->
      <keep-alive>
        <Bottom-List></Bottom-List>
      </keep-alive>
      <router-view></router-view>
    </div>
    <router-view v-if="!$route.meta.keepAlive"/>
  </div>
</template>

<script>
import BottomList from '@/components/mobile/BottomList/index'

export default {
  name: 'App',
  components:{
    BottomList,
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
  margin-top: 0px;
  height: 100%;
  font-size: 8px;

  background-color:whitesmoke;
}
#app div{
  
}
</style>

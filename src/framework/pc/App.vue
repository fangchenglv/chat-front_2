<template>
  <div lang="scss" id="app">
    <router-view v-if="!$route.meta.keepAlive"/>
    
    <el-container v-if="$route.meta.keepAlive">

      <el-header >
        <keep-alive>
          <left-aside>
          </left-aside>
        </keep-alive>
      </el-header>

        <el-main>
          <router-view/>
        </el-main>

    </el-container>

  </div>
</template>

<script>
import leftAside from '@/components/pc/LeftSide'
import {mapGetters} from 'vuex'


export default {
  name: 'App',
  components:{
    leftAside,
  },
  computed:{
    ...mapGetters(['userName']),
  },
  mounted(){
  }
}
</script>

<style lang="scss">

html,body,#app{
    width:100%;
    height:100%;
    background-color:whitesmoke;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  overflow: scroll;
}
 .el-header {
  color: #333;
  text-align: center;
  height: 1rem;
  height:0.95rem; 
  padding:0rem; 
  background-color:#ABD0F7;
  margin-bottom: 0.2rem;
}
.el-main {
  color: #333;
  width: 95%;
  padding:0.5rem 0.2rem 0.1rem 0.2rem;
  text-align: center;
  margin: 0 auto;
  height: 100%;
  overflow: auto;
}
.el-container{
  height: 100%;
}
</style>

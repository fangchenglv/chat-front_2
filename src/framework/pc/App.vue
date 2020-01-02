<template>
  <div id="app">
    <router-view v-if="!$route.meta.keepAlive"/>
    
    <el-container v-if="$route.meta.keepAlive">
      <el-header style="height:0.95rem; padding:0rem; background-color:#ddd">
        <keep-alive>
          <h1>欢迎来到电脑端聊天系统, {{userName}}</h1>
        </keep-alive>
      </el-header>

      <el-container>
        <el-aside>
          <keep-alive>
            <left-aside></left-aside>
          </keep-alive>
        </el-aside>

        <el-main>
          <router-view/>
        </el-main>
      </el-container>
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

<style>

html,body,#app{
    width:100%;
    height:100%;
    background-color:whitesmoke;
}
body{
  /* margin: 0rem 2rem 0rem 2rem; */
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  overflow: hidden;
  
  /* background-image: url("../../assets/img/backGroud.jpg");
  background-repeat: no-repeat;
  background-size: 99% 100%; */
}
 .el-header {
  background-color:#67C23A;
  color: #333;
  text-align: center;
  height: 1rem;
}
.el-aside {
  color: #333;
  height: 100%;
  /* overflow: scroll; */
}
.el-main {
  color: #333;
}
.leftAside{
  overflow: scroll;
}
</style>
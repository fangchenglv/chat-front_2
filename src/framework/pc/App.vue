<template>
  <div id="app">
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
  overflow: scroll;
  
  /* background-image: url("../../assets/img/backGroud.jpg");
  background-repeat: no-repeat;
  background-size: 99% 100%; */
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
  width: 75%;
  padding:0.5rem 0.2rem 0.1rem 0.2rem;
  margin: 0 auto;
  
}
.el-container{
  height: 100%;
}
/* .el-aside{
  color: #333;
  height: 100%;
  float: left;
  display: inline-block;
} */
</style>
<template>
  <div lang="scss" style="float:left; width:100%; margin-bottom:0.1rem">
    <div class="demo-type" style="float:left;width: 1rem;height: 0.5rem;line-height:2em">
      <div>
        <el-avatar > {{name}} </el-avatar>
      </div>
    </div>
    <div 
      v-if="messageid === 0" 
      style="display:inline-block; font-size:0.4rem;margin-left:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left;line-height:2.5em">
      {{messages}}
    </div>
    <img v-if="messageid === 1" :src="msg" alt="图片加载失败" style="display:inline-block;margin-left:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left"/>
    <div v-if="messageid === 2"  style="display:inline-block; font-size:0.4rem;margin-left:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left;line-height:2.5em;color:#006CA7">
    <a    target="_blank" v-bind:href="['https://65.49.204.236/group1/'+JSON.parse(messages).fileUrl]">
    {{JSON.parse(messages).fileName}}</a></div>
    <!-- <el-button  v-if="messageid === 2" style="display:inline-block;font-size:0.5rem;margin-left:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left;line-height:2em"  >{{Filename}} -->
    <!-- </el-button> -->
  </div>

</template>

<script>

export default {
  name: 'friend-item',
  props: ['messageid', 'me', 'name', 'img', 'msg','filea'],
  data(){
    return{
      messages:this.msg,
    }
  },

  methods: {
    init(){

    }
  }
}

</script>
<style scoped>

</style>

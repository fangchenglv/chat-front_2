<template>
  <div style="float:left; width:100%; margin-bottom:0.1rem">
    <div class="demo-type" style="float:left;width: 1rem;height:1rem;">
      <div>
        <el-avatar > {{name}} </el-avatar>
      </div>
    </div>
    <div v-if="messageid === 0" style="display:inline-block; font-size:0.5rem;margin-left:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left;line-height:2em">{{messages}}</div>
    <img v-if="messageid === 1" :src="msg" alt="图片加载失败" style="display:inline-block;margin-left:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left"/>
  </div>

</template>

<script>
export default {
  name: 'friend-item',
  props: ['messageid', 'me', 'name', 'img', 'msg'], 
  data(){
    return{
      messages:this.msg,
    }
  },
}
</script>

<style>

</style>

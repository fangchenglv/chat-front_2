<template>
<div style="float:right; width:100%; margin-bottom:0.1rem">
  <img :src="img" alt="头像" style="float:right;width: 1rem;height: 1rem;">
  <div v-if="messageid === 0" style="display:inline-block; font-size:0.5rem;margin-right:0.2rem;margin-top:0.3rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left">{{msg}}</div>
  <img v-if="messageid === 1" :src="messages[1]" alt="图片加载失败" style="display:inline-block; margin-right:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left"/>
</div>
</template>

<script>
  export default {
    name: 'my-item',
    props: ["messageid", 'me', 'name', 'img', 'msg'], 
    data(){
      return{
        messages:this.msg,
      }
    },
    // computed: {
    //   Img:function(){
    //     console.log(this.img);
    //     return this.img;
    //   }

    // },
  }
</script>
<style scoped>
</style>

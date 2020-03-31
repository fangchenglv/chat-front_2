<template>
<div style="float:right; width:100%; margin-bottom:0.1rem">
  <img :src="img" alt="头像" style="float:right;width: 1rem;height: 1rem;">
  <div style="display:inline-block; font-size:0.7rem;margin-right:0.2rem;margin-top:0.3rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left">{{msg}}</div>
</div>
</template>

<script>
  export default {
    name: 'my-item',
    props: ['me', 'name', 'img', 'msg'], 
    computed: {
      Img:function(){
        console.log(this.img);
        return this.img;
      }

    },
  }
</script>
<style scoped>
</style>

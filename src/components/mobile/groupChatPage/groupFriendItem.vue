<template>

  <div style="float:left; width:100%; margin-bottom:0.1rem">
<!--    <img :src="img" alt="头像" style="float:left;width: 1rem;height: 1rem;">-->

      <div style="float:left;width:1.25rem; height:1.25rem;background-color:rgba(100,100,100,0.45);margin-top: 0rem;border-radius:50%;">
        <p style="color:  #0c0c0c ;margin-top:0.39rem">{{name}}</p>
      </div>
      <div v-if="messageid === 0" style="display:inline-block;font-size:0.5rem;margin-left:0.2rem;margin-top:0.4rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left">{{msg}}</div>
      <img v-if="messageid === 1" :src="msg" alt="图片加载失败" style="display:inline-block;margin-top:0.05rem;margin-left:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left"/>
    </div>


</template>

<script>
  export default {
    name: 'friend-item',
    props: ['messageid', 'me', 'name', 'msg'],
    data(){
      return{
        messages:this.msg,
      }
    },

  }
</script>

<style>

</style>

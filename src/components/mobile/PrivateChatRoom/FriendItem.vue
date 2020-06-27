<template>
<div style="float:right; width:100%; margin-bottom:0.1rem">
  <div style="float:right;width:1.25rem; height:1.25rem;background-color:rgba(159,234,107,0.82);margin-top: 0rem;border-radius:50%;margin-right: 0.2rem">
    <p style="color: #0c0c0c ;margin-top:0.39rem">{{name}}</p>
  </div>
  <div v-if="messageid === 0" style="display:inline-block; font-size:0.5rem;margin-right:0.3rem;margin-top:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left">{{msg}}</div>
  <img v-if="messageid === 1" :src="msg" alt="图片加载失败" style="display:inline-block; margin-right:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left"/>
  <div v-if="messageid== 2" style="border-radius:4%;background-color:#2e579b;display:inline-block; font-size:0.4rem;margin-right:0.3rem;margin-top:0rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left">
    <a :href="msg.content" target="_blank" :title="msg.file.name" >
      <pre style="color: #fdfff8 "> 文件:{{msg.file.name}} </pre>
    </a>
  </div>

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
  }
</script>
<style scoped>
</style>

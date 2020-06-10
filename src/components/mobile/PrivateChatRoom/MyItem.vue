<template>

  <div style="float:left; width:100%; margin-bottom:0.1rem ">
<!--    <van-image :src="img" alt="头像" style="float:left;width: 1rem;height: 1rem;"></van-image>-->
    <div style="float:left;width:1.25rem; height:1.25rem;background-color:rgba(100,100,100,0.45);margin-top: 0rem;border-radius:50% ">
      <p style="color:  #0c0c0c ;margin-top:0.39rem">{{name}}</p>
    </div>
    <div v-if="messageid === 0" style="display:inline-block; font-size:0.5rem;margin-left:0.2rem;margin-top:0.3rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left">{{msg}}</div>
    <img v-if="messageid === 1" :src="msg" alt="图片加载失败" style="display:inline-block;margin-left:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left"/>
    <div v-if="messageid== 2"style="border-radius:4%;background-color:#2e579b;display:inline-block; font-size:0.4rem;margin-right:0.3rem;margin-top:0rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left">
      <a   href=# >
        <pre style="color: #fdfff8 ;"> 文件：{{msg.name}} </pre>
      </a>
    </div>
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
    }
  }
</script>
<style scoped>
</style>

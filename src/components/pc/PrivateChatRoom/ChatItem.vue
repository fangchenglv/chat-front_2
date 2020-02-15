<template>
    <div >

      <div v-if="!me" style="float:left;display:block">
        <img :src="img" alt="头像" style="float:left;width: 0.5rem;height: 0.5rem;">
        <!-- <div class="nt"><span v-if="name">{{name}}</span></div> -->
        <div style="display:inline-block; font-size:0.5rem;margin-right:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float: inherit;">{{msg}}</div>
      </div>

      <div v-if="me" style="float:right;display:block">
        <img :src="img" alt="头像" style="float:right;width: 0.5rem;height: 0.5rem;">
        <div style="display:inline-block; font-size:0.5rem;margin-right:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float: inherit;">{{msg}}</div>
        
        <!-- <div class="nt" ><span v-if="name" >{{name}}</span></div> -->
        
      </div>

    </div>
</template>

<script>
  export default {
    name: 'chat-item',
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
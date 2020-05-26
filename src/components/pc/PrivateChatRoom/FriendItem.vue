<template>
<div style="float:right; width:100%; margin-bottom:0.1rem">

            <div class="demo-type" style="float:right;width: 1rem;height:1rem;">

              <div>
                <el-avatar > {{name}} </el-avatar>
              </div>
            </div>


  <div v-if="messageid === 0" style="display:inline-block;font-size:0.5rem;margin-right:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left">{{msg}}</div>
  <img v-if="messageid === 1" :src="msg" alt="图片加载失败" style="display:inline-block; margin-right:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left"/>
</div>
</template>

<script>
  export default {
    name: 'my-item',
    props: ["messageid", 'me', 'name', 'img', 'msg'], 
    // beforeUpdate(){
    //   console.log(this.msg);
    // },
    // mounted(){
    //   console.log(this.msg);
    // }
  }
</script>
<style scoped>
</style>

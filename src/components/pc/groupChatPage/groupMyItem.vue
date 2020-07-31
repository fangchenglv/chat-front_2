<template>
   <div lang="scss" style="float:right; width:100%; margin-bottom:0.1rem">
      <div style="display:inline-block;font-size:0.3rem;margin-right:1.5rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left;line-height:1rem;color:#778899	">{{time}}</div>
      <br><br><br><br>
    <div class="demo-type" style="float:right;width: 1rem;height: 1rem;">
      <div>
        <el-avatar > {{name}} </el-avatar>
      </div>
    </div>

    <div v-if="messageid === 0" style="display:inline-block; font-size:0.4rem;margin-right:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left;line-height:2.5em">{{msg}}</div>
    <img v-if="messageid === 1" :src="msg" alt="图片加载失败" style="display:inline-block; margin-right:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left"/>
     <div v-if="messageid === 2" :src="msg.fileUrl" style="display:inline-block; font-size:0.4rem;margin-right:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left;line-height:2em;color:#006CA7">
      <a    target="_blank" v-bind:href="['https://65.49.204.236/group1/'+msg.fileUrl]">{{"文件："+msg.fileName}}</a></div>
  </div>
</template>

<script>
export default {
  name: 'my-item',
  props: ["messageid", 'me', 'name', 'img', 'msg','time'],
  data(){
        return {

        }
      },
  mounted(){
        console.log(this.msg, this.msg.fileUrl)
  }
}

</script>

<style>

</style>

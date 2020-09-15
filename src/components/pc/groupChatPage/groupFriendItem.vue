<template>
  <div lang="scss" style="float:left; width:100%; margin-bottom:0.1rem">
<br>
  <div style="display:inline-block; font-size:0.3rem;margin-left:1.5rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left;line-height:2.5em;color:#778899">
            {{time}}
          </div><br><br><br>
    <div class="demo-type" style="float:left;width: 1rem;height:1rem;">
      <div>
        <el-avatar > {{name}} </el-avatar>
      </div>
    </div>
    <div v-if="messageid === 0" style="display:inline-block; font-size:0.4rem;margin-left:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left;line-height:2.5em">{{messages}}</div>
    <img v-if="messageid === 1" :src="msg" alt="图片加载失败" style="display:inline-block;margin-left:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left"/>
    <div v-if="messageid === 2" :src="msg" style="display:inline-block; font-size:0.4rem;margin-left:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left;line-height:2.5em;color:#006CA7">
    <a    target="_blank" v-bind:href="['https://123.56.232.247/group1/'+messages.fileUrl]">
        {{"文件："+messages.fileName}}</a></div>
  </div>

</template>

<script>
export default {
  name: 'friend-item',
  props: ['messageid', 'me', 'name', 'img', 'msg','time'],
  data(){
    return{
      messages:this.msg,
    }
  },
  mounted(){
      if (this.messageid == 2) {
        console.log("！！！！！！！要发送的文件部分",this.messages)
        this.init()
      }
    },
  methods: {
      init(){

      }
    }
}
</script>

<style>

</style>

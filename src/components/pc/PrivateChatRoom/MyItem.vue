<template>
  <div lang="scss" style="float:left; width:100%; margin-bottom:0.1rem">
    <div class="demo-type" style="float:left;width: 1rem;height: 0.5rem;line-height:2em">
      <div>
        <el-avatar > {{name}} </el-avatar>
      </div>
    </div>
    <div 
      v-if="messageid === 0" 
      style="display:inline-block; font-size:0.5rem;margin-left:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left;line-height:2em">
      {{messages}}
    </div>
    <img v-if="messageid === 1" :src="msg" alt="图片加载失败" style="display:inline-block;margin-left:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left"/>
    <a v-if="messageid === 2"  style="display:inline-block;margin-left:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left">{{data = JSON.parse(messages).fileName}}</a>
    <!-- <el-button  v-if="messageid === 2" style="display:inline-block;font-size:0.5rem;margin-left:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left;line-height:2em"  >{{Filename}} -->
    <!-- </el-button> -->
  </div>

</template>

<script>

export default {
  name: 'friend-item',
  props: ['messageid', 'me', 'name', 'img', 'msg','filea'],
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
<style scoped>

</style>

<template>

  <div  class="private-me" >
    <div class="me">
      <p >{{name}}</p>
    </div>
    <div v-if="messageid === 0" class="message" >{{msg}}</div>
    <img v-if="messageid === 1" :src="msg" alt="图片加载失败" class="pic"/>
    <div v-if="messageid== 2" class="file" >
      <a  title="文件" target="_blank" v-bind:href="['https://65.49.204.236/group1/'+msg.fileUrl]"  >
        <p class="filename"> 文件：{{data = JSON.parse(messages).fileName}} </p>
      </a>
    </div>
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
<style lang="scss" scoped>
  .private-me{
    float:left;
    width:100%;
    margin-bottom:0.1rem
  }
  .me{
    float:left;
    width:1.25rem;
    height:1.25rem;
    background-color:rgba(100,100,100,0.45);
    margin-top: 0rem;
    border-radius:50%
  }
  p{
    color:  #0c0c0c ;
    margin-top:0.39rem
  }
  .pic{
    display:inline-block;
    margin-left:0.2rem;
    max-width:50%;
    word-wrap:break-word;
    word-break:break-all;
    float:inherit;
    text-align:left;
  }
  .message{
    display:inline-block;
    font-size:0.5rem;
    margin-left:0.2rem;
    margin-top:0.3rem;
    max-width:50%;
    word-wrap:break-word;
    word-break:break-all;
    float:inherit;
    text-align:left;
  }
  .file{
    border-radius:4%;
    background-color:#2e579b;
    display:inline-block;
    font-size:0.4rem;
    margin-right:0.3rem;
    margin-top:0rem;
    max-width:50%;
    word-wrap:break-word;
    word-break:break-all;
    float:inherit;
    text-align:left
  }
  .filename{
    color: #fdfff8 ;
  }
</style>

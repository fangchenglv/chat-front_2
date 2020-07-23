<template>
<div class="private-friend" >
  <div class="friend">
    <p >{{name}}</p>
  </div>
  <div v-if="messageid === 0"  class="message">{{msg}}</div>
  <img v-if="messageid === 1" :src="msg" alt="图片加载失败"  class="pic"/>
  <div v-if="messageid== 2"  class="file" >
    <a    target="_blank" v-bind:href="['https://oixrkrhw5prsi53uh4j2itw2h3upq7q3kii6ywcl5yboyaw4pab66oqd.onion:80/group1/'+msg.fileUrl]">
      <pre > 文件：{{msg.fileName}} </pre>
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
  .private-friend{
    float:right; width:100%; margin-bottom:0.1rem
  }
  .friend{
    float:right;width:1.25rem;
    height:1.25rem;
    background-color:rgba(159,234,107,0.82);
    margin-top: 0rem;
    border-radius:50%;
    margin-right: 0.2rem
  }
  p{color: #0c0c0c ;margin-top:0.39rem}
  pre{color: #fdfff8}
  .message{
    display:inline-block;
    font-size:0.5rem;
    margin-right:0.3rem;
    margin-top:0.2rem;
    max-width:50%;
    word-wrap:break-word;
    word-break:break-all;
    float:inherit;
    text-align:left
  }
  .pic{
    display:inline-block;
    margin-right:0.2rem;max-width:50%;
    word-wrap:break-word;
    word-break:break-all;
    float:inherit;
    text-align:left
  }
  .file{
   border-radius:4%;
    background-color: #2e579b;
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
</style>

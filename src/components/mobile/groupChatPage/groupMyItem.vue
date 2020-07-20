<template>
<div class="group-me" >
  <div class="me">
    <p >{{name}}</p>
  </div>
  <div v-if="messageid === 0" class="message" >{{msg}}</div>
  <img v-if="messageid === 1" :src="msg" alt="图片加载失败" class="pic" />
</div>
</template>

<script>
  export default {
    name: 'my-item',
    props: ["messageid", 'me', 'name', 'msg'],
    data(){
      return{
        messages:this.msg,
      }
    },
  }
</script>

<style lang="scss" scoped>
.group-me{
  float:right;
  width:100%;
  margin-bottom:0.1rem
}
  .me{
    float:right;
    width:1.25rem;
    height:1.25rem;
    background-color:rgba(159,234,107,0.82);
    margin-top: 0rem;
    border-radius:50%;
  }
  p{
    color: #0c0c0c ;
    margin-top:0.39rem;
  }
  .message{
    display:inline-block;
    font-size:0.5rem;
    margin-right:0.2rem;
    margin-top:0.35rem;
    max-width:50%;
    word-wrap:break-word;
    word-break:break-all;
    float:inherit;
    text-align:left
  }
  .pic{
    display:inline-block;
    margin-right:0.2rem;
    max-width:50%;
    word-wrap:break-word;
    word-break:break-all;
    float:inherit;
    text-align:left
  }
</style>

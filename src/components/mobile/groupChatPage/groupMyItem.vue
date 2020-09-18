<template>
<div class="group-me" >
  <div>
    <div class="time">{{time}}</div>
  </div>
  <div class="demo-type" >
  <div class="me">
    <p >{{name}}</p>
  </div>

  <div v-if="messageid === 0" class="message" >{{msg}}</div>
  <img v-if="messageid === 1" :src="msg" alt="图片加载失败" class="pic" />
  <div v-if="messageid === 2 && !isaudio(msg.fileUrl)" class="file" >
    <a  title="文件" target="_blank" v-bind:href="['https://65.49.204.236/group1/'+msg.fileUrl]"  >
<!--    <a  title="文件" target="_blank" v-bind:href="['https://123.56.232.247/group1/'+msg.fileUrl]"  >-->
      <p class="filename">文件：{{msg.fileName}}</p>
    </a>
  </div>

  <audio v-if="playAudio==1" id="audio" :src="msg.fileUrl" ></audio>

    <div v-if="messageid === 2 && isaudio(msg.fileUrl)" class="file" >
      <van-button @click="bf(msg.fileUrl)" plain >点击播放</van-button>

      <p class="filename">名称：{{msg.fileName}}</p>
    </div>
</div>
</div>
</template>

<script>
  export default {
    name: 'my-item',
    props: ["messageid", 'me', 'name', 'msg','time'],
    data(){
      return{
          audiourl: "",
          playAudio:0,
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
       console.log("执行一次")
      },
        // 判断是否为录音文件
        isaudio(fileName) {
            console.log("============走判断了");
            fileName = this.msg.fileName;
            console.log(fileName);
            let flieArr = fileName.split('.');
            var suffix = String(flieArr[flieArr.length - 1]);//获取后缀
            console.log("后缀名是啥",suffix);
            if(suffix.toString()==="wav")
            {
                return true;
            }
            else
            {
                console.log("执行了这里");
                return false;
            }
        },
        //播放音频
        bf(audio) {
            this.playAudio=1;
            // var audio = document.getElementById("audio");
            console.log("执行了这里========audio=",audio  );
            if (audio !== null) {
                //检测播放是否已暂停.audio.paused 在播放器播放时返回false.
                // alert(audio.paused);

                console.log("执行了这里audio !== null");

            }

        },
    }
  }
</script>

<style lang="scss" scoped>
  .demo-type{
    float:right;
  }
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
    max-width:6rem;
    word-wrap:break-word;
    word-break:break-all;
    float:inherit;
    text-align:left;
    /*background-color:brown;*/
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
.file{
  border-radius:4%;
  background-color: #2e579b;

  display:inline-block;
  font-size:0.4rem;
  margin-right:0.3rem;
  margin-top:0rem;
  max-width:6rem;
  word-wrap:break-word;
  word-break:break-all;
  float:inherit;
  text-align:left
}
.filename{
  color: #fdfff8 ;
}
  .time{
    display:inline-block;
    font-size:0.3rem;
    /*margin-right:1rem;*/
    max-width:97%;
    word-wrap:break-word;
    word-break:break-all;
    float:inherit;
    text-align:right;
    line-height:1rem;
    /*margin-left: auto;*/
    width: 100%;
    color:#778899;
  }
</style>

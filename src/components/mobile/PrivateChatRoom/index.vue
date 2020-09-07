<template>
  <div class="chatPage" >
    <!-- 聊天顶部 -->
    <van-nav-bar
      :title= friendName
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
    />

    <div v-if="File !== null" style="position:sticky; top:0">
      <strong style="padding-right:0.2rem">{{File.name}}</strong>
      <button @click="stopRead">暂停</button>
      <button @click="continueFile">继续</button>
      <p  v-if="this.fileUpload.enableRead == true">{{this.percent}}</p>
    </div>

    <!-- 聊天内容主体 -->
    <div id="body">
      <div v-for="(item, ind) in this.messageList" :key="ind">
        <FriendItem v-if="item.fromUser.id == userId" :messageid="item.id"  :msg="item.message" :name="item.fromUser.nickName" me="true" :filea="item.File" :time="item.time"></FriendItem>
        <MyItem v-else :messageid="item.id"  :msg="item.message" :name="item.fromUser.nickName" :filea="item.File" :time="item.time" ></MyItem>
      </div>
    </div>

    <!-- 聊天底部 -->
    <van-tabbar>
      <van-tabbar-item >
        <input placeholder="输入信息" v-model="message" class="input"/>
        <van-button @click="sendMsg" plain type="info" >发送</van-button>
        <div class="bottom" >
          <van-dropdown-menu direction="up">
            <van-dropdown-item ref="item">
<!--              <van-uploader accept="video/mp4" use-before-read :before-read="RecordVideo" :after-read="afterReadvideo">-->
                <van-button @click="onClickShow" type="primary" plain class="file-sending" >录视频</van-button>
                <van-overlay :show=" show" >
<!--                  @click="onClickHide"-->
                  <van-button id="begin" @click="getUserMediaStream({ audio: true, video: { facingMode: 'user' } })">开始</van-button>
                  <van-button  :disabled="this.flag==1?false:true" @click="toggleRecording()" ref="record">录制</van-button>
                  <van-button ref="play"  @click="play()">播放</van-button>
                  <van-button id="download" @click="bufferToDataUrl()">下载</van-button>
                  <van-button @click="onClickHide">返回</van-button>
<!--                  <van-button id="reStart" disabled>重新开始</van-button>-->
<!--                  <van-button id="upload">上传</van-button>-->
                  <video id="gumVideo" width="500" height="500" autoplay='autoplay' muted></video>
                  <video id="gumVideo2" width="500" height="500" autoplay='autoplay' muted></video>
                  <canvas id="myCanvas"></canvas>
                </van-overlay>
<!--              </van-uploader >-->
<!--              <van-uploader accept="image/gif,image/jpeg,image/jpg,image/png" :before-read="beforeReadImg" :after-read="afterReadImg">-->
<!--                <van-button type="primary" plain class="file-sending">录音</van-button>-->
<!--              </van-uploader >-->
              <van-uploader accept="image/gif,image/jpeg,image/jpg,image/png" :before-read="beforeReadImg" :after-read="afterReadImg">
                <van-button type="primary" plain class="file-sending">图片</van-button>
              </van-uploader >
              <van-uploader accept=".xls,.doc,.txt,.pdf,.gif,.jpeg,.jpg,.png,.pptx" result-type="dataUrl" :before-read="beforeReadFile" :after-read="afterReadFile">
                <van-button type="primary" plain class="file-sending">文件</van-button>
              </van-uploader >
              <van-button block type="info" @click="onConfirm" plain>返回</van-button>
            </van-dropdown-item>
          </van-dropdown-menu>
        </div>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
import {sendMessage, getHistoryReadList, getUnreadMessageList} from "@/api/friendOperation"
import FriendItem from "./FriendItem"
import MyItem from './MyItem';
import { type } from 'os';
import Data from 'vue';

export default {
  components: {
      MyItem,
      FriendItem
  },
  data() {
    return {
      flag:0,
      beginButton:document.querySelector('van-button#begin'),
      recordButton :document.querySelector('van-button#record'),
      playButton : document.querySelector('van-button#play'),
      downloadButton : document.querySelector('van-button#download'),
      reStartButton : document.querySelector('van-button#reStart'),
      uploadBtn :document.querySelector('van-button#upload'),
      gumVideo : document.querySelector('#gumVideo'),
      gumVideo2 : document.querySelector('#gumVideo2'),
      mediaRecorder:[],
      recordedBlobs:[],
      sourceBuffer:null,
      show:false,
      message: "",
      imageFile: "",
      File: null,
      fileUrl: "",
      ff:0,
      total:0,
      reader:null,
      fileUpload:{
        cuLoaded: 0,
        step: 65536,
        enableRead: true
      },
      startTime: 0,
      readerObj: null,
      websock: null,
      historyMessageList:[],    //历史消息列表
      unreadList:[],    //未读消息列表
      unreadLeaveFriend:this.$store.getters.leaveMessage,
      friendId:""+this.$route.params.friendId,
      userId:this.$store.getters.userId,
      messageList:[],
      pic:this.$route.params.avatar,
      percent:null,
      friendName:this.$route.params.name,
      myNickName:this.$store.getters.userNickname,
      friendNickName:this.$route.params.name,
      };
  },
  computed:{
    currendStartChatList:{
      get(){
        if (this.$websocket.getters.privateMessage(this.friendId) === undefined || this.$websocket.getters.privateMessage(this.friendId) === null) {
          return [];
        }
        return this.$websocket.getters.privateMessage(this.friendId)
      },
      set(val){
      }
    },
  },
  mounted() {
    this.init();
  },
  beforeDestroy(){
    this.$websocket.state.privateMessage[this.friendId] = this.currendStartChatList;
    this.$websocket.dispatch("StopChatId");
  },
  methods: {
    onClickShow() {
      this.show=true;
    },

    onClickHide() {
      stream.getTracks().forEach(function (track) {
        track.stop();

      });
      this.show=false;
      this.flag=0;

    },
    getUserMediaStream(constraints, cb) {
      // navigator.mediaDevices.getUserMedia(constraints)
      //   .then(this.handleSuccess)
      //   .catch(err => { cb(err, null); });

      console.log("是你吗?miaom"+gumVideo);
      try{
        navigator.mediaDevices.getUserMedia(constraints)
          .then(this.handleSuccess)
      }catch(err){
        cb(err, null);
        console.log(err);
      }

    },
    handleSuccess(stream) {
      console.log("J进来了吗")
      console.log(stream)
      // var recordButton = document.querySelector('van-button#record');
      // recordButton.disabled="true";
      console.log("??",this.$refs.record.disabled);
      // this.$refs.record.disabled=false;
      this.flag=1;
      console.log("??555",this.$refs.record.disabled);
      console.log('getUserMedia() got stream: ', stream);
      window.stream = stream;
      if (window.URL) {
        // gumVideo.src = window.URL.createObjectURL(stream);
        console.log("mmm1")
        gumVideo.srcObject = stream;
        // return new Promise((resolve) => {
        //     gumVideo.onloadedmetadata = () => {
        //         resolve(gumVideo);
       //     };
       // });
        // gumVideo.play()
        console.log(gumVideo.srcObject)
      } else {
       gumVideo.src = stream;
        console.log("mmm2")
        console.log(gumVideo)
      }
      console.log("mmm3")

        var c = document.getElementById("myCanvas");
        c.width = 400;
        c.height = 300;
        console.log("mmmmmmamsiaj")
        var i;
        gumVideo.addEventListener('play', function () {
          console.log("mmm6")
          var p = document.createElement('p');
          p.innerText = 'hello';
    // i = window.setInterval(function () {
    //     if (littleVideo) {
    //         drawLittleVideo(c);
    //     } else {
    //         drawBigVideo(c);
    //     }
    // }, 20);
        }, false);
        gumVideo.addEventListener('pause', function () { if (i) { window.clearInterval(i); console.log("mmm4");} }, false);
        gumVideo.addEventListener('ended', function () { if (i) { clearInterval(i); console.log(i+"mmm5")} }, false);
    },

    startRecording() {
      // recordedBlobs = [];
      var options = { mimeType: 'video/webm;codecs=vp9' };
      console.log("mmm7");
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        console.log(options.mimeType + ' is not Supported');
        options = { mimeType: 'video/webm;codecs=vp8' };
        console.log("mmm8");
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          console.log(options.mimeType + ' is not Supported');
          options = { mimeType: 'video/webm' };
          console.log("mmm9");
          if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            console.log("mmm10");
            console.log(options.mimeType + ' is not Supported');
            options = { mimeType: '' };
          }
        }
      }
      try {
        this.mediaRecorder = new MediaRecorder(window.stream, options);
        console.log("mmm11");
      } catch (e) {
        console.error('Exception while creating MediaRecorder: ' + e);
        alert('Exception while creating MediaRecorder: '
            + e + '. mimeType: ' + options.mimeType);
        console.log("mmm12");
        return;
      }
      console.log('Created MediaRecorder', this.mediaRecorder, 'with options', options);
      console.log("mmm13");
      this.$refs.record.textContent = '停止';
      // this.playButton.disabled = true;
      // this.downloadButton.disabled = true;
      // this.reStartButton.disabled = true;
      this.mediaRecorder.onstop = this.handleStop;
      this.mediaRecorder.ondataavailable = this.handleDataAvailable;
      this.mediaRecorder.start(10); // collect 10ms of data
      console.log('MediaRecorder started', this.mediaRecorder);
    },
    handleStop(event) {
      console.log("是在这里停下来的吗")
      this.onClickHide();
      console.log('Recorder stopped: ', event);
      console.log("mmm14");
    },
    handleDataAvailable(event) {
      console.log("mmm15");
      console.log("recordBlobs有东西了吗？",this.recordedBlobs)
      if (event.data && event.data.size > 0) {
        this.recordedBlobs.push(event.data);
        console.log("mmm16");
      }
    },
    toggleRecording() {
      console.log("这个时候是什么值啊？"+this.$refs.record.textContent)
      if (this.$refs.record.textContent === '录制' || this.$refs.record.textContent === '重录') {
        // littleVideo = false;
        console.log("mmm17");
        this.startRecording();
        setTimeout(() => {
          this.stopRecording();
          this.$refs.record.textContent = '重录';
          console.log("mmm18");
          // this.playButton.disabled = false;
          // this.downloadButton.disabled = false;
          // this.reStartButton.disabled = false;
        }, 10000);
      } else {
        this.stopRecording();
        console.log("mmm19");
        this.$refs.record.textContent = '重录';
        // this.playButton.disabled = false;
        // this.downloadButton.disabled = false;
        // this.reStartButton.disabled = false;
      }
    },
    stopRecording() {
  //影藏录制中提
      this.mediaRecorder.stop();
      console.log("mmm20");
      this.bufferToDataUrl()
      console.log('Recorded Blobs: ', this.recordedBlobs);
    //recordedVideo.controls = true;
    },
    play() {
      console.log("mmm21");
      var superBuffer = new Blob(this.recordedBlobs, { type: 'video/mp4' });
      //recordedVideo.src = window.URL.createObjectURL(superBuffer);
      gumVideo2.src = window.URL.createObjectURL(superBuffer);
      gumVideo2.play()
    },
    upload() {
  //保存在本地，通过post请求
      console.log("mmm22");
      var blob = new Blob(this.recordedBlobs, { type: 'video/mp4' });
  // var data = new FormData();
  // data.append('video', blob);
  // data.append('qw', 123);
  // data.append('question', 1);
  // $.ajax({
  //     type: "POST",
  //     url: "/form/data",
  //     data: data,
  //     processData: false,   //  告诉jquery不要处理发送的数据
  //     contentType: false,    // 告诉jquery不要设置content-Type请求头
  //     success: function (msg) {
  //         console.log(msg);
  //     }
  // });
    },
//buffer转dataUrl
    bufferToDataUrl() {
      console.log("mmm23");
      var mmm;
      let that=this;
      let blob = new Blob(this.recordedBlobs, { type: "video/webm" });
      let reader = new FileReader();
      reader.onload = function () {
        console.log("mmm24");
        var a = document.createElement('a');
        a.style.display = 'none';
        a.href = reader.result;

        console.log("你猜这是什么东西,这不就是我们的好文件吗："+a.href)
        that.dataUrlToFile(a.href)
        // t
        that.File=that.dataUrlToFile(a.href)
        // that.File.content=a.href
        that.total=that.File.size
        that.ff=1
        that.sendMsg()
        console.log("这个会是文件本体吗？",that.dataUrlToFile(a.href))
        //
    //文件名 通过方法传进来 检测是否合法？
        a.download = 'record.mp4';
        document.body.appendChild(a);
        a.click();
        // this.dataUrlToFile(a.href);
        // setTimeout(function () {
        //   console.log("mmm25");
        //   document.body.removeChild(a);
        //   window.URL.revokeObjectURL(reader.result);
        // }, 100);
      };

      // var mm;
      // this.dataUrlToFile(mmm);
      reader.readAsDataURL(blob);
      console.log("这个是啥子："+this.file);
      // this.dataUrlToFile(that.mmm)
      // this.dataUrlToFile()
      // this.dataUrlToFile()
      // mm=reader.result
      // this.dataUrlToFile()
      // this.dataUrlToFile(reader.readAsDataURL(blob))
    },
    restartRecord() {
  //清楚存留 按钮功能重置
      recordButton.textContent = '录制';
      playButton.disabled = true;
      downloadButton.disabled = true;
      reStartButton.disabled = true;
      console.log("mmm26");
  //handleSuccess();
      navigator.mediaDevices.getUserMedia({ audio: true, video: { facingMode: 'user' } }).
      then(handleSuccess).catch(handleError);
    },
//转文件
    dataUrlToFile(dataUrl) {
      let binary = atob(dataUrl.split(",")[1]);
      let data = [];
      console.log("mmm27有了吗？");
      for (var i = 0; i < binary.length; i++)
        data.push(binary.charCodeAt(i));
      return new File([new Uint8Array(data)], "recorded-video.webm", {
        type: "video/webm"
      });
      console.log("这个文件长啥样啊？"+File);
    },
//获取屏幕流
    getDisplayMediaStream(cb) {
      console.log("mmm28");
      navigator.mediaDevices.getDisplayMedia()
        .then(stream => { cb(null, stream); })
        .catch(err => { cb(err, null); })
    },



    RecordVideo(){
      // this.getUserMediaStream(constraints, cb),
      //   console.log("摄像头开了吗" )
      return true
    },
    afterReadvideo(){
      return true
    },
    init(){
      this.$websocket.state.privateUnreadNumber[this.friendId] = null;
      this.$websocket.dispatch("StartChatId", [this.friendId, "private"]);
      this.getUnreadList(this.$store.getters.userId, this.$route.params.friendId);
      this.websockOnMessage();
    },
    //显示结果进度
    showProcess(){
      console.log("全部", this.total)
      console.log("当前", this.fileUpload.cuLoaded)
      var percent = (this.fileUpload.cuLoaded / this.total) * 100;
      console.log("####文件传输百分比", percent)
      percent=percent.toFixed(2)
      this.percent=percent+'%';
      // document.getElementById('Status').innerText = percent;
    },
    //绑定reader，onmessage里面用
    bindReader() {
      this.startTime = new Date();
      this.fileUpload.enableRead = true;
      this.reader = new FileReader();
      //读取一段成功
      let me = this
      this.reader.onload = function (e) {
        console.info('读取总数：' + e.loaded);
        if (me.fileUpload.enableRead == false)
          return false;
        //根据当前缓冲区来控制客户端读取速度
        if (me.$websocket.dispatch("GetBufferedAmount") > me.fileUpload.step * 10) {
          setTimeout(function () {
            //继续读取
            console.log('--------------》进入等待');
            me.loadSuccess(e.loaded);
          }, 3);
        } else {
          //继续读取
          me.loadSuccess(e.loaded);
        }
      }
      //开始读取
      this.readBlob();
    },
    //读取文件成功处理
    loadSuccess(loaded) {
      //将分段数据上传到服务器
      var blob = this.reader.result;
      //使用WebSocket 服务器发送数据
      this.$websocket.dispatch("SendWebsocketFileMessage", blob);
      //如果没有读完，继续
      this.fileUpload.cuLoaded += loaded;
    },
    //指定开始位置，分块读取文件
    readBlob() {
      //指定开始位置和结束位置读取文件
      console.log("readBlob的file为啥为空", this.File)
      var blob = this.File.slice(this.fileUpload.cuLoaded, this.fileUpload.cuLoaded + this.fileUpload.step);
      this.reader.readAsArrayBuffer(blob);
    },
    websockOnMessage() {
      let param = null;
      this.$websocket.state.websock.onmessage = e => {
        // const data = JSON.parse(e.data);
        console.log("###########又得开始看返回，生气", e)
        // const data = JSON.parse(e.data);
        let data = e.data;
        const re = /^[0-9]+.?[0-9]*/;
        const page = /^.*\..*$/;
        if (data.status === -1) {
          return
        }
        // 数字的话就是文件部分了
        console.log("喵dd1.5");
        if (re.test(data)) {
          console.log("喵dd2.0");
          this.fileUpload.cuLoaded = parseInt(data);
          console.log('当前已上传：' + this.fileUpload.cuLoaded);
          this.showProcess();
          console.log('开始上传数据........');
          this.bindReader();
        } else if (page.test(data) && (this.ff==1)) {
          // this.fileUrl = data;
          console.log("喵dd3.0");
          this.sendFile(data)
          this.ff=0;
        } else if (data == 'canceled') {
          console.log("喵dd4.0");
          console.log('取消上传数据........');
          this.fileUpload.cuLoaded = 0;
          this.showProcess();
          this.fileUpload.enableRead = false;
          this.reader.abort();
        } else if (data == 'ok') {
          console.log("喵dd5.0");
          if (this.fileUpload.cuLoaded < this.total) {
            this.readBlob();
          } else {
            this.$websocket.dispatch("SendWebsocketFileMessage", 'act:complete');
            console.log('总共上传：' + this.fileUpload.cuLoaded + ',总共用时：' + (new Date().getTime() - this.startTime.getTime()) / 1000);
          }
          this.showProcess();
        }
        // else {
        //   const
        console.log("喵dd2",e);
        data = JSON.parse(e.data);
          if (data.data) {
          if (data.data.type !== "REGISTER" && data.status === 200) {
            if (!data.data.toGroupId && data.data.fromUserId == this.friendId) {
              let msgId = -1;
              if (data.data.type === "SINGLE_SENDING") {
                let dat = data.data;
                msgId = 0;
                param = {
                  "fromUser": {
                    "id": this.$route.params.friendId,
                    "nickName": this.$route.params.name,
                  },
                  "toUser": {
                    "id": this.$store.getters.userId,
                    "nickName": this.$store.getters.userNickname,
                  },
                  "message": dat.content,
                  "id": msgId,
                  "time":dat.time,
                };
              }
              else if (data.data.type === "SINGLE_SENDING_IMG"){
                  let dat = data.data;
                  msgId = 1;
                  param = {
                    "fromUser":{"id":this.$route.params.friendId,
                      "nickName": this.$route.params.name,
                    },
                    "toUser":{"id":this.$store.getters.userId,
                      "nickName":this.$store.getters.userNickname,
                    },
                    "message":dat.content,
                    "id": msgId,
                    "time":dat.time,
                  };
                } else {
                  let dat = data.data;
                  msgId = 2;
                  param = {
                    "fromUser":{"id":this.$route.params.friendId,
                      "nickName": this.$route.params.name,
                    },
                    "toUser":{"id":this.$store.getters.userId,
                      "nickName":this.$store.getters.userNickname,
                    },
                    // "message":dat.content,
                    "message":JSON.parse(dat.content),
                    "id": msgId,
                    "time":dat.time,
                  };
                }
              //添加到信息列表，以便展示信息
              if (!this.messageList) {
                this.messageList = [param];
              } else {
                this.messageList.push(param);
              }
              print(this.messageList, "消息列表嗷嗷")
              this.currendStartChatList.push(data.data)
            } else {
              let re = /SINGLE/;
              if (re.test(data.data.type) === true) {
                this.$toast({
                  message: "新的好友信息，请注意查看",
                  position: "top",
                })
                if (this.$websocket.state.privateMessage.find((val, ind) => ind == data.data.fromUserId) != null || this.$websocket.state.privateMessage.find((val, ind) => ind == data.data.fromUserId) != undefined) {
                  this.$websocket.state.privateMessage[data.data.fromUserId].push(data.data);
                  this.$websocket.state.privateUnreadNumber[data.data.fromUserId] = (+this.$websocket.state.privateUnreadNumber[data.data.fromUserId]) + 1;
                } else {
                  this.$websocket.state.privateMessage[data.data.fromUserId] = [data.data];
                  this.$websocket.state.privateUnreadNumber[data.data.fromUserId] = +1;
                }
              } else {
                this.$toast({
                  message: "新的群信息，请注意查看",
                  position: "top",
                })
                if (this.$websocket.state.groupMessage.find((val, ind) => ind == data.data.toGroupId) != null || this.$websocket.state.groupMessage.find((val, ind) => ind == data.data.toGroupId) != undefined) {
                  this.$websocket.state.groupMessage[data.data.toGroupId].push(data.data);
                  this.$websocket.state.groupUnreadNumber[data.data.toGroupId] = this.$websocket.state.groupUnreadNumber[data.data.toGroupId] + 1;
                } else {
                  this.$websocket.state.groupMessage[data.data.toGroupId] = [data.data];
                  this.$websocket.state.groupUnreadNumber[data.data.toGroupId] = +1;
                }
              }
            }
          }
        }
      }
    },
    ParparePrivateChatMessage(){
      //初始化数据吧
      if (!this.currendStartChatList) {
        return ;
      }
      let param = null, msgId = -1;
      this.currendStartChatList.forEach(data => {
        if(data.type === "SINGLE_SENDING"){
          msgId = 0;
          if (data.fromUserId === this.friendId) {
            param = {
              "fromUser":{"id":this.$route.params.friendId,
                          "nickName": this.$route.params.name,
                          },
              "toUser":{"id":this.$store.getters.userId,
                        "nickName":this.$store.getters.userNickname,
                        },
              "message":data.content,
              "id": msgId,
              "time":data.time,
            };
          }
          else {
            param = {
              "fromUser":{"id":this.$store.getters.userId,
                          "nickName":this.$store.getters.userNickname,
                          },
              "toUser":{"id":this.$route.params.friendId,
                        "nickName": this.$route.params.name,
                        },
              "message":data.content,
              "id": msgId,
              "time":data.time,
            };
          }
        }
        else if (data.type === "SINGLE_SENDING_IMG"){
          msgId = 1;
          if (data.fromUserId === this.friendId) {
            console.log("第三步")
            param = {
              "fromUser":{"id":this.$route.params.friendId,
                          "nickName": this.$route.params.name,
                          },
              "toUser":{"id":this.$store.getters.userId,
                        "nickName":this.$store.getters.userNickname,
                        },
              "message":data.content,
              "id": msgId,
              "time":data.time,
            };
          }
          else {
            param = {
              "fromUser":{"id":this.$store.getters.userId,
                          "nickName":this.$store.getters.userNickname,
                          },
              "toUser":{"id":this.$route.params.friendId,
                        "nickName": this.$route.params.name,
                        },
              "message":data.content,
              "id": msgId,
              "time":data.time,
            };
          }
        }
        // else if(data.type === "SINGLE_SENDING_FILE"){
        else{
          msgId = 2;
          if (data.fromUserId === this.friendId) {
            param = {
              "fromUser":{"id":this.$route.params.friendId,
                "nickName": this.$route.params.name,
              },
              "toUser":{"id":this.$store.getters.userId,
                "nickName":this.$store.getters.userNickname,
              },
              // "message":data.content,
              "message":JSON.parse(data.content),
              "id": msgId,
              "time":data.time,
            };
            console.log("嘿1",JSON.parse(data.content));
          }
          else {
            param = {
              "fromUser":{"id":this.$store.getters.userId,
                "nickName":this.$store.getters.userNickname,
              },
              "toUser":{"id":this.$route.params.friendId,
                "nickName": this.$route.params.name,
              },
              // "message":data.content,
              "message":JSON.parse(data.content),
              "id": msgId,
              "time":data.time,
            };
            console.log("嘿2",JSON.parse(data.content));
          }
        }
        this.messageList.push(param);
        console.log("第四步")
      })
    },
    sendMsg(){
      let data = null;
      let param = null;
      if (this.message.trim() === "" && this.imageFile.trim() === "" && this.File === null){
        this.$toast({
          message: "输入信息不能为空",
          position:"top"
        });
        return
      }
      var date=new Date();
      //年
      var year=date.getFullYear();
      //月
      var month=date.getMonth()+1;
      //日
      var day=date.getDate();
      //时
      var hh=date.getHours();
      //分
      var mm=date.getMinutes();
      //秒
      var ss=date.getSeconds();
      var rq=year+"-"+month+"-"+day+" "+hh+":"+mm+":"+ss;
        if(this.imageFile !== "") {
        data = {
          "fromUserId" : ""+this.userId,
          "toUserId" : ""+this.friendId,
          "content": this.imageFile,
          "type" : "SINGLE_SENDING_IMG",
          "time":""+rq,
        };
        console.log("第五步")
        param = {
          "fromUser":{"id":this.$store.getters.userId,
                      "nickName":this.$store.getters.userNickname,
          },
          "toUser":{"id":this.$route.params.friendId,
                    "nickName":this.$route.params.name,
          },
          "message":this.imageFile,
          "id": 1,
          "time":rq,
        };
          this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.friendId])
            .then(res => {
              this.currendStartChatList.push(data);
              this.messageList.push(param);
            });
      } else if(this.message !== ""){
        data = {
          "fromUserId" : ""+this.userId,
          "toUserId" : ""+this.friendId,
          "content" : ""+this.message,
          "type" : "SINGLE_SENDING",
          "time":""+rq,
        };
        param = {
          "fromUser":{"id":this.$store.getters.userId,
                      "nickName":this.$store.getters.userNickname,
          },
          "toUser":{"id":this.$route.params.friendId,
                    "nickName":this.$route.params.name,
          },
          "message":this.message,
          "id": 0,
          "time":rq,
        };
          this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.friendId])
            .then(res => {
              this.currendStartChatList.push(data);
              this.messageList.push(param);
            });
      }
      else {
          this.$websocket.dispatch("SendWebsocketFileName", this.File.name);
        }
      // this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.friendId]);
      // this.currendStartChatList.push(data);
      // this.messageList.push(param);
      this.message = "";
      this.imageFile = "";
      // this.file = "";
      this.websockOnMessage();
    },
    sendFile(fileUrl){
      var date=new Date();
      //年
      var year=date.getFullYear();
      //月
      var month=date.getMonth()+1;
      //日
      var day=date.getDate();
      //时
      var hh=date.getHours();
      //分
      var mm=date.getMinutes();
      //秒
      var ss=date.getSeconds();
      var rq=year+"-"+month+"-"+day+" "+hh+":"+mm+":"+ss;
      //文件部分
      let data = {
        "fromUserId" : ""+this.userId,
        "toUserId" : ""+this.friendId,
        "content" : JSON.stringify({
          "fileName": this.File.name,
          "fileSize": this.File.size,
          "fileUrl": fileUrl
        }),
        "type" : "FILE_MSG_SINGLE_SENDING",
        "time":""+rq,
      };
      let param = {
        "fromUser":{"id":this.$store.getters.userId,
          "nickName":this.$store.getters.userNickname,
        },
        "toUser":{"id":this.$route.params.friendId,
          "nickName":this.$route.params.name,
        },
        "message":{
          "fileName": this.File.name,
          "fileSize": this.File.size,
          "fileUrl": fileUrl
        },
        "id": 2
      };
      this.$websocket.dispatch("SendWebsocketMessage", [JSON.stringify( data ), this.friendId]);
      this.currendStartChatList.push(data);
      this.messageList.push(param);
      this.File = null;
      this.fileUpload.cuLoaded = 0;
      this.fileUpload.enableRead = true;
    },

    beforeReadImg(file, detail){
      console.log("第一步")
      return true;
    },
    afterReadImg(file, detail){
      if (file.file.size > 65530) {
        this.$toast({
          message: "图片过大，请转换为文件发送",
          position: "top",
        })
        return
      }
      this.imageFile = file.content;
      this.sendMsg()
    },
    beforeReadFile(file, detail){
      return true;
    },
    afterReadFile(file, detail){
      this.ff=1

      console.log("!!!!!!!!!!喵喵喵喵!!!!!!!!!!!",file);
      console.log("文件file",file)
      // console.log("文件file.file",file.file)
      this.File=file.file;

      this.total=file.file.size;
      this.sendMsg()
    },
    onConfirm(){
      console.log("按了吗")
      this.$refs.item.toggle();
    },
    stopRead() {
      //中止读取操作
      console.info('中止，cuLoaded：' + this.fileUpload.cuLoaded);
      this.fileUpload.enableRead = false;
      this.reader.abort();
    },
    //继续
    continueFile() {
      console.info('继续，cuLoaded：' + this.fileUpload.cuLoaded);
      this.fileUpload.enableRead = true;
      this.readBlob();
    },
    getUnreadList(fromId, toId){
    this.ParparePrivateChatMessage()
      getUnreadMessageList(fromId, toId).then(response =>{
        this.unreadList = response.data.data;
        if (this.unreadLeaveFriend.length > 0) {
          for (let i = 0; i < this.unreadLeaveFriend.length; i++) {
            if (this.unreadLeaveFriend[i].fromUser !== null && this.unreadLeaveFriend[i].fromUser.id == this.friendId) {
              this.unreadLeaveFriend.splice(i, 1);
              this.$store.state.leaveMessage = this.unreadLeaveFriend;
              break
            }
          }
        }
        if(this.unreadList){
          this.unreadList.forEach((data) =>{
            let t = {};
            if (data.type == "0") {
              t.fromUser = data.fromUser;
              t.message = data.message;
              t.id = 0;
              t.time=data.time;
            }
            //要是未读信息是图片咋整
            else if (data.type == "1") {
              t.fromUser = data.fromUser;
              t.message = data.message;
              t.id = 1;
              t.time=data.time;
            }
            //要是未读消息的文件
            else if(data.type == "2") {
              //只能先留口子
              t.fromUser = data.fromUser;
              t.message = JSON.parse(data.message);
              t.id = 2;
              console.log("文件未读",t)
              t.time=data.time;
            }
            if(!this.messageList){
              this.messageList = [t];
            }else{
              this.messageList.push(t);
            }
          })
        }

      }).catch()
    },
    onClickLeft(){
      this.$router.push({path:"/friendList"});
    },
  },
}
</script>

<style lang="scss" socped>
#body{
  margin:0.1rem 0.1rem 0rem 0.1rem;
  width:98%;
  height: 84.5%;
  background-color:rgb(250, 250, 250);
  margin-bottom: 1.45rem;
  overflow:auto;
}
.chatPage{
    height: 100%
}
.input{
    background-color: rgb(250, 250, 250); line-height:180%; font-size:0.5rem;
}
.bottom{
  width:0.5rem; float:right
}
.file-sending{
  padding-left:4.5rem;padding-right:4.5rem
}
#gumVideo {
  transform: rotateY(180deg);
}
</style>

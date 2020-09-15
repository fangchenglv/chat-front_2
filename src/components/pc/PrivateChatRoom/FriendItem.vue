<template>
  <div lang="scss" style="float:right; width:100%; margin-bottom:0.1rem">
      <div style="display:inline-block;font-size:0.3rem;margin-right:1.5rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left;line-height:1rem;color:#778899	">{{time}}</div>
<br><br><br><br>
   <div class="demo-type" style="float:right;width: 1rem;height: 0.5rem;line-height:2em">
      <div>
        <el-avatar > {{name}} </el-avatar>
      </div>
    </div>
    <div v-if="messageid === 0" style="display:inline-block;font-size:0.4rem;margin-right:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left;line-height:1rem">{{msg}}</div>
    <img v-if="messageid === 1" :src="msg" alt="图片加载失败" style="display:inline-block; margin-right:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left"/>
    <div v-if="messageid === 2" style="display:inline-block;font-size:0.4rem;margin-right:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left;line-height:1rem;color:#006CA7">
    <a    target="_blank" v-bind:href="['https://123.56.232.247/group1/'+ msg.fileUrl]">{{"文件："+msg.fileName}}</a></div>
    <!-- <el-button type="text" v-if="messageid === 2" style="display:inline-block;font-size:0.5rem;margin-right:0.2rem;max-width:50%;word-wrap:break-word;word-break:break-all;float:inherit;text-align:left;line-height:0.5rem" @click="downFile()">{{msg}}
    </el-button> -->
  </div>

</template>

<script>

import { type } from 'os';
import Data from 'vue';
import { mapState, mapGetters } from 'vuex'

  export default {
    name: 'my-item',
    props: ["messageid", 'me', 'name', 'img', 'msg','filea','time'],

    data(){
      return {

      }
    },

    // downFile(){
    //   console.log("能下载吗",filea);
    //   const arr = filea.split(',');
    //   const mime = arr[0].match(/:(.*?);/)[1];
    //   const bstr = atob(arr[1]);
    //   let n = bstr.length;
    //   const u8arr = new Uint8Array(n);
    //   while (n--) {
    //     u8arr[n] = bstr.charCodeAt(n);
    //   }
    //   if (window.navigator.msSaveBlob) {
    //     // for ie 10 and later
    //     try {
    //       const blobObject = new Blob([u8arr], { type: mime });
    //       window.navigator.msSaveBlob(blobObject, 'aaa.xls');
    //     } catch (e) {
    //       console.log(e);
    //     }
    //   } else {
    //     const url = window.URL.createObjectURL(new Blob([u8arr], { type: mime }));
    //     const link = document.createElement('a');
    //     link.href = url;
    //     link.setAttribute('download', 'aaa.xls');
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link); // 下载完成移除元素
    //     window.URL.revokeObjectURL(url); // 释放掉blob对象
    //   }
    // },
  }


</script>

</style>

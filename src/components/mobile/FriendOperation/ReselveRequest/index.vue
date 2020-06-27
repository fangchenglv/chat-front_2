<template>
  <div>
    <van-nav-bar
      title="处理好友请求"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      id="nav"
      style="margin-top:0rem;"
    />
    <div v-for="data in findList" :key="data.id">
      <br/>
      <van-card style="background-color:#fff;" >
        <div slot="title" style="font-size:0.5rem;">
          <p>好友:{{data.fromUser.userName}}</p>
          <p>申请时间:{{data.applyTime}}</p>
        </div>
        <div slot="footer">
          <van-button @click="toGroup">选择好友分组</van-button>
          <van-button
            type="info"
            plain
            @click="sendRequest(data.id, 1, data.friendTypeId)">
            同意</van-button>
          <van-button
            plain
            type="warning"
            @click="sendRequest(data.id, 2, data.friendTypeId)">
            不同意</van-button>
        </div>
      </van-card>
      <van-dialog
        v-model="groupShow"
        title="选择好友分组"
        show-cancel-button >
        <van-radio-group v-model="choicedGroupId" v-for="i in friendGroupList" :key="i.id">
          <van-radio :name=i.id style="margin-left:0.5rem;margin-bottom:0.3rem;">{{i.typeName}}</van-radio>
        </van-radio-group>
      </van-dialog>
    </div>

    <div v-if="show === true">
      <van-pagination
        id="page"
        v-model="pageNum"
        :total-items="total"
        :show-page-size="5"
        :items-per-page="pageSize"
        force-ellipses
      />
    </div>

  </div>
</template>

<script>
import {searchFriendRequest, solveRequest} from '@/api/friendOperation';

export default {
  name:"reselveFriendRequest",
  data(){
    return{
      findList:[],
      total: 0,
      usrid:this.$store.getters.userId,
      code:0,
      pageSize:2,
      pageNum:1,
      show:false,
      groupShow:false,
      friendGroupList:this.$store.getters.myFriendList,
      choicedGroupId:-1,
    }
  },
  methods:{
    //处理好友申请,
    sendRequest(id, status, friendTypeId) {  //发送是否同意添加好友的请求
      if (status === 1) {
        status = "1";
        if (this.choicedGroupId == -1){
          this.$toast("请选择分组")
          return 0
        }
      } else if (status === 2) {
        status = "2";
      }
      solveRequest(id, status, this.choicedGroupId, friendTypeId) //同意添加好友，
        .then(response => {
          let data = response.data.data;
          this.choicedGroupId = -1;
          if (data === "1") {
            this.$toast( "操作已经成功");
          };
        })
        .catch(err => {
          console.log("!!!!!!!!!!!!!!!!!!!!!!!!", err);
        });
    },
    onClickLeft(){
      this.$router.push({path:'/friendOperation'});
    },
    handleCommand(){
      searchFriendRequest(this.usrid, this.code, this.pageNum, this.pageSize)
      .then(response => {
        let data = response.data.data;
        if (data.total !== 0) {
          this.total = data.total;
          if(this.total > 5){
            this.show = true;
          }
          this.findList = data.list;
        }
      })
      .catch(error => {
        console.log("!!", error);
      });
    },
    toGroup(){
      this.groupShow = true
    }
  },
  mounted(){
    this.handleCommand();
  }
}
</script>

<style scoped>
#page{
  position: absolute;
  left: 0rem;
  bottom: 0rem;
  width: 100%;
}
</style>

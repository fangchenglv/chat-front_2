<template>
  <div>
    <van-nav-bar
      title="历史好友请求"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      id="head"
    />
    <van-tabbar v-model="active" @change="handleClick" class="switch">
      <van-tabbar-item icon="agree-o" name="1" >已经同意添加的好友</van-tabbar-item>
      <van-tabbar-item icon="refuse-o" name="2" >已经拒绝添加的好友</van-tabbar-item>
    </van-tabbar>
    <van-pagination v-model="currentPage" :total-items=total :items-per-page="5" @change="handleCurrentChange" class="page"/>

    <div v-for="tables in tableData" :key="tables.index">
      <van-cell
        :title="tables.friendUserName"
        :value="tables.applyTime"
        :label="tables.status"
        style="background-color:rgb(250,250,250);text-align:left;border:solid 0.02rem #ddd; top:2.3rem;border-left:none; border-right:none"/>
    </div>

  </div>
</template>

<script>
  import {searchFriendRequest} from '@/api/friendOperation';
export default {
  name:"historyFriend",
  data(){
    return{
      findList:[],
      currentPage: 1,
      total: 0,
      page: 1,
      pageSize: 5,
      pageNum:1,
      code:1,
      index:0,
      id:this.$store.getters.userId,
      value:true,
      friendGroupList:this.$store.getters.myFriendList,
      tableData:[],
      active:-1,
    }
  },
  methods:{
    onClickLeft(){
      this.$router.push({path:"/friendOperation"});
    },
    handleClick(index) {
      this.tableData = [];
      searchFriendRequest(this.id, index, this.pageNum, this.pageSize)
        .then(response => {
          let data = response.data.data;
          this.index=index;
          if (data.total !== 0) {
            this.total = data.total;
            this.findList = data.list;
            for(let i = 0; i < this.findList.length; i++){
              let tmp = {};
              tmp['applyTime'] = this.findList[i]['applyTime'];
              tmp['friendUserName'] = this.findList[i]['fromUser']['userName'];
              tmp['friendNickName'] = this.findList[i]['fromUser']['nickName'];
              tmp['status'] = (index === "1")? "通过申请" : "拒绝申请";
              this.tableData.push(tmp);
            }
          }
        })
        .catch(error => {
          console.log("!!", error);
        });
    },
    handleCurrentChange(val) {
      this.pageNum = val;
      console.log(this.pageNum);
      this.handleClick(this.index);
    },
  }
}
</script>

<style>
  .switch{
    background-color: #fff;
    font-size: 0.4rem;
    width: 100%;
    position: absolute;
    left: 0rem;
    top: 1rem;
    line-height: 1rem;
    margin-bottom: 0.1rem;
  }
  .page{
    width: 100%;
    font-size: 0.4rem;
    position: absolute;
    left: 0rem;
    bottom: 0rem;
    background-color: #fff;
  }
</style>

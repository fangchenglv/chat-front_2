<template>
  <div lang="scss">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="已经同意添加的好友" name="1">已经同意添加的好友</el-tab-pane>
      <el-tab-pane label="已经拒绝添加的好友" name="2">已经拒绝添加的好友</el-tab-pane>
    </el-tabs>
    <!-- 好友处理结果展示部分 -->

    <el-table
        :data="tableData"
        stripe
        style="width: auto">
        <el-table-column
            prop="applyTime"
            label="申请时间"
            width="">
        </el-table-column>
        <el-table-column
            prop="friendUserName"
            label="好友用户名"
            width="">
        </el-table-column>
        <el-table-column
            prop="friendNickName"
            label="好友昵称"
            width="">
        </el-table-column>
        <el-table-column
            prop="status"
            label="处理状态"
            width="">
        </el-table-column>
    </el-table>
    <!-- 分页部分 -->
    <el-row>
      <el-col :span="24" class="toolbar pageBar">
        <el-pagination
          :hide-on-single-page="value"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="10"
          :page-size="pageSize"
          layout=" prev, pager, next, sizes, total"
          :total="total">
        </el-pagination>
      </el-col>
    </el-row>
    <!-- 分页部分结束 -->
  </div>
</template>

<script>
import {searchFriendRequest} from '@/api/friendOperation';

export default {
  name:"acceptRejectFriend",
  data(){
    return{
      findList:[],
      currentPage: 1,
      total: 0,
      page: 1,
      pageSize: 10,
      pageNum:1,
      code:1,
      index:0,
      id:this.$store.getters.userId,
      value:true,
      friendGroupList:this.$store.getters.myFriendList,
      tableData:[],
      activeName:"0",
    }
  },
  methods:{
    handleClick(code) {
      this.tableData = [];
      searchFriendRequest(this.id, this.activeName, this.pageNum, this.pageSize)
      .then(response => {
        let data = response.data.data;
        let i =0;
        if (data.total !== 0) {
          this.total = data.total;
          this.findList = data.list;
          for(; i < this.findList.length; i++){
            let tmp = {};
            tmp['applyTime'] = this.findList[i]['applyTime'];
            tmp['friendUserName'] = this.findList[i]['fromUser']['userName'];
            tmp['friendNickName'] = this.findList[i]['fromUser']['nickName'];
            tmp['status'] = (this.activeName === "1")? "通过申请" : "拒绝申请";
            this.tableData.push(tmp);
          }
        }
        })
      .catch(error => {
        console.log("!!", error);
      });
    },
    //pageSize改变时
    handleSizeChange(val) {
        this.pageSize = val;
        this.handleCommand();
    },
    //pageNum改变时
    handleCurrentChange(val) {
        this.pageNum = val;
        this.handleClick(this.activeName);
    },
  },
}
</script>

<style>

</style>

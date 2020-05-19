<template>
  <div class="solveRequest">
    <!-- card部分 -->
    <div v-if="findList !== []">
      <el-row>
        <el-col :span="10" v-for="data in findList" :key="data.id" :offset="2">
          <el-card shadow="hover">
              <img :src=data.fromUser.avatar class="image"/>
              <div style="font-size:0.4rem;">
                <p>用户名: {{data.fromUser.userName}}</p>
                <p>申请时间:{{data.applyTime}}</p>
              </div>

              <div class="friendG">
                <el-button
                  type="info"
                  plain
                  @click="dialogVisible = true"
                >选择分组</el-button>
                <el-button
                  type="primary"
                  plain
                  @click="sendRequest(data.id, 1, data.friendTypeId)"
                >同意</el-button>
                <el-button
                  type="warning"
                  plain
                  @click="sendRequest(data.id, 2, data.friendTypeId)"
                >不同意</el-button>
              </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 弹出框 -->
      <el-dialog title="好友分组" :visible.sync="dialogVisible">
        <div v-for="item in friendGroupList" :key="item.id" style="text-align:left">
          <el-radio-group v-model="choicedGroupId">
            <el-radio :label="item.id">{{item.typeName}}</el-radio>
          </el-radio-group>
        </div>
        <span slot="footer" class="dialog-footer">
          <el-button 
            plain 
            type="success"
            @click="dialogVisible = false">完成</el-button>
        </span>
      </el-dialog>

    </div>
    <div v-else>没有相关用户信息</div>
    <!-- card部分结束 -->

    <!-- 分页部分 -->
    <el-row>
      <el-col :span="24" class="toolbar pageBar">
        <el-pagination
          :hide-on-single-page="value"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]"
          :page-size="pageSize"
          layout=" prev, pager, next, sizes, total"
          :total="total">
        </el-pagination>
      </el-col>
    </el-row>
    <!-- 分页部分结束 -->
    <!-- <router-view></router-view> -->
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { error } from "util";
import {searchFriendRequest, solveRequest} from '@/api/friendOperation';

export default {
  name: "solveFriendRequest",
  //import引入的组件需要注入到对象中才能使用
  components: {},
  data() {
    //这里存放数据
    return {
      findList:[],
      currentPage: 1,
      total: 0,
      page: 1,
      pageSize: 8,
      pageNum:1,
      code:0,
      id:this.$store.getters.userId,
      value:true,
      friendGroupList:this.$store.getters.myFriendList,
      choicedGroupId:-1,
      dialogVisible:false,
    };
  },
  //监听属性 类似于data概念
  computed: {
  },
  //方法集合
  methods: {
    handleCommand() {
      searchFriendRequest(this.id, this.code, this.pageNum, this.pageSize)
      .then(response => {
          let data = response.data.data;
          if (data.total !== 0) {
            this.total = data.total;
              this.findList = data.list;
              // console.log("找到的还没添加好友的请求", this.findList);
            // this.$router.push({ path: "/solveRequest/requestResult" });
          }
        })
        .catch(error => {
          console.log("!!", error);
        });
    },
    //处理好友申请,
    sendRequest(id, status, friendTypeId) {  //发送是否同意添加好友的请求
      if (status === 1) {
        status = "1";
      } else if (status === 2) {
        status = "2";
      }
      // console.log(this.choicedGroupId)
      if (this.choicedGroupId == -1 && status === "1"){
        this.$message({
          message:"请选择分组",
          type:"error"
        })
        return 0
      }
      // console.log(friendTypeId)
      solveRequest(id, status, this.choicedGroupId, friendTypeId) //同意添加好友，
        .then(response => {
          // console.log(this.choicedGroupId)
          let data = response.data.data;
          this.choicedGroupId = -1;
          // console.log("返回的申请添加好友的提示代号", data);
          if (data === "1") {
            this.$message({
              message: "操作已经成功",
              type: "success"
            });
          };
          this.$router.replace({path:"/home"});
        })
        .catch(err => {
          console.log("!!!!!!!!!!!!!!!!!!!!!!!!", err);
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
      this.handleCommand();
    },
  },
  mounted() {
    this.handleCommand();
    // console.log(this.friendGroupList);
  }
};
</script>
<style scoped>
.image {
  width: 20%;
  display: inline-block;
  float: left;
}
.el-dropdown-link {
  cursor: pointer;
  color: #409eff;
}
.clearfix:before,
.clearfix:after {
  display: table;
  content: "";
}
.clearfix:after {
  clear: both;
}

.friendG{
  float: right;
  margin: 0.5rem 0 0.5rem 0;
}
</style>

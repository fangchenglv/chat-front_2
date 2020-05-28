<template >
  <div class="GroupChat">
    <div class="firstPart" id="firstPart">
      <el-card style="margin-top:0.5rem; height:90%;position:relative;">
        <div style="height:55%;width:30%;margin:0 auto">

                            <div>
                              <el-avatar shape="square":size="80"> {{form.name}} </el-avatar>
                            </div>

        </div>
        
        <div>
          <h2 style="margin-top:0.3rem;margin-bottom:0.5rem"><strong>群名：</strong>{{form.name}}</h2>
          <span ><strong>群描述：</strong>{{form.descriptor}}</span>
          <div style="position:absolute;bottom:1rem;left:0.1rem;right:0.1rem;">
            <el-button type="primary" plain @click="toGroupChatPage">进入群聊</el-button>
            <el-button type="primary" plain @click="dialogTableVisible = true">添加新成员</el-button>
            <el-button type="primary" plain @click="dialogFormVisible = true">修改群组信息</el-button>
            <el-button type="primary" plain @click="getGroupMember">查看群成员</el-button>
            <el-button type="primary" plain @click="quitGroupChat">退出群聊</el-button>
            <el-button type="primary" plain @click="quitAndDismissGroup">解散群聊</el-button>
            <el-button type="primary" plain @click="getGroupHistory">聊天记录</el-button>
          </div>
        </div>
      </el-card>
    </div>
    <div class="secondPart" id="secondPart">
      <div><el-button type="text" icon="el-icon-close" style="float:right" @click="handleClose"></el-button></div>
      <br style="clear:both"/>
      <!-- 动态添加群信息吧 -->
      <ul>
        <div v-for="(item, ind) in groupFriend" :key="ind">
          <el-avatar> {{item.userName}} </el-avatar>
          <p>{{item.userName}}</p>
        </div>
      </ul>
      <!-- 用一个表格展示吧准备 -->
    </div>

    <el-dialog title="添加新群成员" :visible.sync="dialogTableVisible" >
      <el-table
        border
        :data="groupFriend"
        tooltip-effect="dark"
        @selection-change="handleSelectionChange">
        <el-table-column
          type="selection"
          width="200">
        </el-table-column>
        <el-table-column
          prop="friendInfo.nickName"
          label="姓名"
          >
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="appendGroupMember">确认添加</el-button>
        <el-button type="primary" @click="dialogTableVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <el-dialog title="修改群组信息" :visible.sync="dialogFormVisible" :before-close="handleChange">
      <el-form :model="form" ref="changeChat">
        <el-form-item label="新的群名" >
          <el-input v-model="form.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="新的群描述" >
          <el-input v-model="form.descriptor" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="info" plain @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" plain @click="dialogFormVisible = false">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {changeGroupChatInfo, 
        getMyGroupList, 
        getMyGroupChatPerson, 
        quitOneGroupChat, 
        deleteMyGroupChat, 
        addNewGroupMember } from "../../../api/friendOperation"
export default {
  data(){
    return{
      groupNum: this.$route.params.groupNum,
      dialogFormVisible:false,
      dialogTableVisible:false,
      form:{
        name: "",
        descriptor: "",
        groupId:undefined,
      },
      myId:this.$store.getters.userId,
      groupFriend:this.$store.getters.allFriend,
      multipleSelection: [],
      
    }
  },
  computed: {
    groupDetail:function(){
      let data = this.$store.getters.myGroupChat;
      let dat = [];
      for(let i = 0; i < data.length; i++){
        if(data[i].groupNum === this.groupNum){
          return data[i];
        }
      }
    }
  },
  mounted(){
    this.init();
  },
  methods:{
    init(){
      this.form.name = "" + this.groupDetail.groupName;
      this.form.descriptor = "" + this.groupDetail.description;
      this.form.groupId = this.groupDetail.id;
      getMyGroupList(this.myId)
      .then(res => {
        this.$store.dispatch("GetMyGroupChat", res.data.data);
      })
    },
    getGroupHistory(){
      this.$router.push({name: "groupHistoryPage", params: {id: this.form.groupId}})
    },
    toGroupChatPage(){
      this.$router.push({name: "groupChatPage", params:{groupId: this.form.groupId, myId: this.myId, name:this.form.name}})
    },
    handleChange(){
      if(this.form.name.trim() === ""){
        this.init();
        return
      } else if (this.form.name.trim() === this.groupDetail.groupName && this.form.descriptor === this.groupDetail.description){
        return
      } else {
        changeGroupChatInfo(this.form.groupId, this.form.name, this.form.descriptor)
          .then(res => {
            getMyGroupList(this.myId)
              .then(res => {
                this.$store.dispatch("GetMyGroupChat", res.data.data);
              })
          })
      }
    },
    appendGroupMember(){
            if(this.multipleSelection.length === 0){
              return;
            }
            let userIds = "";
            for(let i = 0; i < this.multipleSelection.length; i++){
              userIds = this.multipleSelection[i].friendId + ""
            }
            // userIds = userIds.slice(0, userIds.length-1);
            addNewGroupMember(this.form.groupId, userIds)
              .then(res => {
                this.$message({
                  message: "添加群成员成功",
                  type:"success"
                })
              })
              .catch(e => {
                this.$message({
                  message: "添加群成员失败",
                  type:"error"
                })
              })
    },
    handleSelectionChange(val){
      this.multipleSelection = val;
      // console.log(this.multipleSelection);
    },
    getGroupMember(){
      getMyGroupChatPerson(this.form.groupId)
        .then(res =>{
          console.log("群成员信息", res);
          var obj = document.getElementById("secondPart");
          obj.setAttribute("class", "secondPartChange");
          var obj = document.getElementById("firstPart");
          obj.setAttribute("class", "firstPartChange");
          let tmpGroupFriend = res.data.data;
          let len = tmpGroupFriend.length;
          for (let i = 0; i < len; i++) {
            this.groupFriend.push({
              userName: tmpGroupFriend[i].user.nickName,

            })
          }
        })
    },
    handleClose(){
      var obj = document.getElementById("secondPart");
      obj.setAttribute("class", "secondPart");
      var obj = document.getElementById("firstPart");
      obj.setAttribute("class", "firstPart");
      this.groupFriend = [];
    },
    quitGroupChat(){
      quitOneGroupChat(this.form.groupId, this.myId)
        .then(res => {
          this.$message({
            message:"您已退出群聊",
            type:"success"
          })
          this.$router.replace({path:"/home"});
        })
        .catch(e => {
          this.$message({
            message:"您退出群聊失败",
            type:"warning"
          })
        })
    },
    quitAndDismissGroup(){
      deleteMyGroupChat(this.form.groupId, this.myId)
        .then(res => {
          this.$message({
            message:"群聊已经删除",
            type:"success"
          })
          this.$router.replace({path: "/home"});
        })
        .catch(e => {
          this.$message({
            message:"删除群聊失败",
            type:"warning"
          })
        })
    },
  }
}
</script>

<style>
.GroupChat{
  height: 100%;
  overflow: hidden;
}
.firstPart{
  height: 100%;
  width: 100%;
  float: left;
}
.firstPartChange{
  height: 100%;
  width: 60%;
  float: left;
}
.secondPart{
  height: 100%;
  width: 0%;
  float: right;
}
.secondPart div{
  display: none;
}
.secondPartChange{
  height: 90%;
  width:40%;
  float: right;
  overflow: auto;
  margin-top: 2%;
  /* margin-left: 0.3rem; */
  /* transform: translateY(-5%); */
  /* -webkit-transform: translateY(-5%); */
  /* margin: 0 auto; */
  background-color: floralwhite;
  border-radius: 0.1rem;
}
</style>

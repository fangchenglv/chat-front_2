<template>
  <div>
      <van-nav-bar
        title="群聊"
        left-text="返回"
        left-arrow
        @click-left="onClickLeft"
        id="head"
      />
      <div class="body">
        <img :src=form.avatar />
        <van-divider />
        <p >群名:{{form.name}}</p>
        <van-divider/>
        <p>群介绍:{{form.descriptor}}</p>
        <van-divider/>
        <div style="margin-top:0.1rem">
          <van-button type="default" style="width:100%" @click="newGroupMessage">修改群组信息</van-button>
          <van-button type="default" style="width:100%" @click="newGroupMember">添加新成员</van-button>
          <van-button type="default" style="width:100%" @click="quitGroupChat">退出群聊</van-button>
          <van-button type="default" style="width:100%" @click="quitAndDismissGroup">解散群聊</van-button>
        </div>
      </div>

      <van-tabbar  id='foot'>
        <van-tabbar-item icon="chat-o" @click="toGroupChatroom">聊天</van-tabbar-item>
        <van-tabbar-item icon="more-o" @click="toGroupHistoryPage">查看历史记录</van-tabbar-item>
        <van-tabbar-item icon="ellipsis" @click="checkFriend">查看群成员</van-tabbar-item>
      </van-tabbar>

  </div>

</template>

<script>
import {getMyGroupChatPerson,
        quitOneGroupChat,
        deleteMyGroupChat,
        addNewGroupMember } from "../../../api/friendOperation"
export default {
  data(){
    return{
      show:false,
      groupNum: this.$route.params.groupNum,
      form:{       //群的信息吧
        name: "",
        descriptor: "",
        groupId:undefined,
        avatar:"",
      },
      myId:this.$store.getters.userId,
      groupFriend:this.$store.getters.allFriend,
      multipleSelection: [],
    }
  },
  computed: {
    groupDetail:function(){
      let data = this.$store.getters.myGroupChat;
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
      this.form.avatar = this.groupDetail.avatar;
    },
    onClickLeft(){
      this.$router.push({path:"/friendList"});
    },
    checkFriend(){
      this.$router.push({name: "checkGroupFriend", params: {groupId: this.form.groupId}})
    },
    quitGroupChat(){
      quitOneGroupChat(this.form.groupId, this.myId)
        .then(res => {
          this.$toast("您已退出群聊")
          this.$router.replace({path:"/friendList"});
        })
        .catch(e => {
          this.$message("您退出群聊失败");
        })
    },
    quitAndDismissGroup(){
      deleteMyGroupChat(this.form.groupId, this.myId)
        .then(res => {
          this.$toast("群聊已经删除");
          this.$router.replace({path: "/friendList"});
        })
        .catch(e => {
          this.$toast("删除群聊失败");
        })
    },
    newGroupMessage(){
      this.$router.push({name:"newMessage", params:{groupNum: this.groupNum}});
    },
    newGroupMember(){
      this.$router.push({name:"newGroupChatMember", params:{groupNum: this.groupNum, groupId:this.form.groupId}});
    },
    toGroupChatroom(){
      this.$router.push({name: "groupChatPage", params:{groupId: this.form.groupId, myId: this.myId, name:this.form.name}})
    },
    toGroupHistoryPage(){
      this.$router.push({name: "groupHistoryPage", params: {id: this.form.groupId}})
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
        userIds = this.multipleSelection[i].friendId + ","
      }
      userIds = userIds.slice(0, userIds.length-1);
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
    },
    getGroupMember(){
      getMyGroupChatPerson(this.form.groupId)
        .then(res =>{
          var obj = document.getElementById("secondPart");
          obj.setAttribute("class", "secondPartChange");
          var obj = document.getElementById("firstPart");
          obj.setAttribute("class", "firstPartChange");
          this.groupFriend = res.data.data;
        })
    },
    handleClose(){
      var obj = document.getElementById("secondPart");
      obj.setAttribute("class", "secondPart");
      var obj = document.getElementById("firstPart");
      obj.setAttribute("class", "firstPart");
    },
  }
}
</script>

<style>
#head{
  position: absolute;
  left: 0rem;
  top: 0rem;
  width: 100%;
}
.body{
  margin-top: 1.4rem;
  padding-top: 0.3rem;
  background-color: rgb(250, 250, 250);
  font-size:0.5rem
}
</style>

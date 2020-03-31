<template>
  <div>
    <el-row>
      <el-col>
        <el-menu
          @open="handleOpen"
          @close="handleClose"
          background-color="#ABD0F7"
          text-color="#fff"
          active-text-color="#ffd04b"
          mode="horizontal"
          menu-trigger="click"
        >
          <el-submenu index="1" >
            <template slot="title">
              <i class="el-icon-menu"></i>
              <span>
                <strong >操作</strong>
              </span>
            </template>
            <el-menu-item-group >
              <el-menu-item index="/friendGroup">
                <span @click="toPath0">新建好友分组</span>
              </el-menu-item>
              <el-menu-item index="/requestFriend">
                <span @click="toPath1">添加新的好友</span>
              </el-menu-item>
              <el-menu-item index="/solveRequest">
                <span @click="toPath2">查询好友申请并处理申请</span>
              </el-menu-item>
              <el-menu-item index="/acceptRejectFriend">
                <span @click="toPath3">查询已处理的好友申请</span>
              </el-menu-item>
              <el-menu-item index="/newGroupChat">
                <span @click="toPath4">新建群聊</span>
              </el-menu-item>
            </el-menu-item-group>
          </el-submenu>

          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-user-solid"></i>
              <span @click="getFriendList()">
                <strong>好友列表</strong>
              </span>
            </template>
            <el-menu-item-group>
              <div v-for="item in myFriendList" :key="item.id">
                <el-menu-item index="/myFriendList">
                  <span @click="toPath(item.id)">{{item.typeName}}</span>
                </el-menu-item>                
              </div>
            </el-menu-item-group>
          </el-submenu>

          <el-submenu index="3">
            <template slot="title">
              <i class="el-icon-user-solid"></i>
              <span @click="getGroupList()">
                <strong>群组列表</strong>
              </span>
            </template>
            <el-menu-item-group>
              <div v-for="(item, id) in myGroupList" :key="id">
                <el-menu-item index="/myGroupList">
                  <span @click="toPathGroup(item.groupNum)">{{item.groupName}}</span>
                </el-menu-item>                
              </div>
            </el-menu-item-group>
          </el-submenu>

          <el-menu-item index="4">
            <i class="el-icon-s-home"></i>
            <span slot="title" @click="toHome()">聊天</span>
          </el-menu-item>
          <el-menu-item index="5">
            <i class="el-icon-setting"></i>
            <span slot="title" @click="logout()">登出</span>
          </el-menu-item>
          <p style="font-size:0.5rem;float:right;margin-right:3rem">用户:{{name}}</p>
        </el-menu>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
import { logout_ } from "@/api/login";
import {getMyFriendList, getMyGroupList} from "./../../../api/friendOperation"

export default {
  name: "sidebar",
  data(){
    return{
      name:this.$store.getters.userName,
      myFriendList:[],
      myGroupList:[],
    }
  },
  props: {},
  computed: {
    // ...mapGetters(["myFriendList"])
  },
  // mounted() {
  //   window.addEventListener('beforeunload', this.beforeunloadHandler())
  // },
  // destroyed(){
  //   window.removeEventListener('beforeunload', this.beforeunloadHandler())
  // },
  methods: {
    //实现点击浏览器叉号就退出的功能。
    beforeunloadHandler(){
      logout_(this.$store.getters.userId);
    },
    getFriendList() {
      getMyFriendList(this.$store.getters.userId).then(res =>{
        const data = res.data.data;
        this.myFriendList = data
        this.$store.dispatch("GetAllFriend", data).then(res =>{});
      })
    },
    getGroupList(){
      getMyGroupList(this.$store.getters.userId)
        .then(res => {
          this.myGroupList = res.data.data;
          this.$store.dispatch("GetMyGroupChat", res.data.data);
          // console.log(this.myGroupList);
        })
        .catch((error) => {
          console.log(error);
        })
    },
    toHome(){
      this.$router.push({path:"/home"});
    },
    logout(){
      // const sock = this.$store.getters.sock;
      // sock.closeMyself();
      this.$router.push({path:"/login"})
      logout_(this.$store.getters.userId);
    },
    handleOpen(key, keyPath) {
      // console.log(key, keyPath);
    },
    handleClose(key, keyPath) {
      // console.log(key, keyPath);
    },
    toPath0() {
      this.$router.push({ path: "/newFriendGroup" });
    },
    toPath1() {
      this.$router.push({ path: "/requestFriend" });
    },
    toPath3(){
      this.$router.push({path:"/acceptRejectFriend"});
    },
    toPath2() {
      this.$router.push({ path: "/solveRequest" });
    },
    toPath4(){
      this.$router.push({path:"/newGroupChat"});
    },
    toPath(groupid) {
      this.$router.push({ name: "friendList", params: { groupId: groupid } });
    },
    toPathGroup(id){
      this.$router.replace({name: "groupChat", params: {groupNum: id}});
    }
  }
};
</script>
<style scoped>
.el-col{
  height: 100%;
  /* overflow: scroll; */
}
.el-row{
  text-align: left;
}
.el-menu h2{
  text-align:center;
}
</style>

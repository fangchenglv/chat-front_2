<template>
  <div>
    <van-nav-bar
      title="修改好友分组"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      id="head"
    />
    <div v-for="(item, ind) in groupData" :key="ind">
      <!-- <div> -->
        <van-card style="background-color:rgb(255,255,255);margin-top:0.1rem; top:1rem">
          <template #thumb>
            <p style="font-size:0.5rem;width:200%">分组名：{{item.typeName}}</p>
          </template>
          <template #footer>
            <!-- <van-button type="info" @click="dialogFormVisible = true">修改分组名</van-button> -->
            <van-button type="info" @click="handleClick(item)">删除分组</van-button>
          </template>
        </van-card>
        <!-- <van-popup v-model="dialogFormVisible">
          <van-form @submit="changeName(item)">
            <van-field
              v-model="newName.name"
              name="新群名"
              label="新群名"
              :placeholder="item.typeName"
              :rules="[{ required: true, message: '请填写新群名' }]"
            />
            <div style="margin: 16px;">
              <van-button round block type="info" native-type="submit">
                提交
              </van-button>
            </div>
          </van-form>
        </van-popup>
      </div> -->

    </div>
  </div>
</template>

<script>
import { deleteFriendGroup, changeFriendGroupName } from "../../../../api/friendOperation";
export default {
  data(){
    return{
      dialogFormVisible: false,
      newName:{
        name:""
      },

    }
  },
  computed:{

    groupData:function () {
      const all = this.$store.getters.myFriendList;
      return all;
    }
  },
  methods: {
    // changeName(row){
    //   changeFriendGroupName(row.id, this.newName.name).then(res => {
    //     this.$store.dispatch("GetMyFriendList", this.$store.getters.userId).then(res => {
    //       this.$toast("修改分组名成功");
    //     });
    //   })
    //   // this.row = null;
    //   this.newName.name = "";
    //   this.dialogFormVisible = false;
    // },
    onClickLeft(){
      this.$router.back();
    },
    handleClick(row) {
      if (!row) {
        return
      }
      deleteFriendGroup(row.id).then(res => {
        this.$store.dispatch("GetMyFriendList", this.$store.getters.userId)
          .then(res => {
            this.$router.back();
          });
      })
      // console.log(row);
    }
  }
}
</script>

<style>

</style>

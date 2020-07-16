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
      <van-card >
        <template #thumb>
          <p>分组名：{{item.typeName}}</p>
        </template>
        <template #footer>
          <van-button type="info" @click="handleClick(item)">删除分组</van-button>
        </template>
      </van-card>
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
    }
  }
}
</script>

<style lang="scss" scoped>
  .head{
    margin-top: 1rem;
  }
  .van-card{
    background-color:rgb(255,255,255);
    margin-top:0.1rem;
    top:1rem;
  }
p{
  font-size:0.5rem;width:200%
}
</style>

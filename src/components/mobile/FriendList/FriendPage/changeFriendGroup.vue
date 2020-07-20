<template>
  <div>
    <van-nav-bar
      title="修改分组"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      id="head"
    />
    <van-radio-group v-model="radio" >
      <van-cell-group v-for="(item, ind) in tableData" :key="ind">
        <van-cell :title=item.typeName clickable @click="handleCurrentChange(item.id)">
          <template #right-icon>
            <van-radio :name=item.id />
          </template>
        </van-cell>
      </van-cell-group>
    </van-radio-group>
    <van-button @click="changeFriendGroup" type="primary" class="commit" >确认</van-button>
    <van-button @click="resetFriendGroup" type="info" class="recover" >重置</van-button>
  </div>
</template>

<script>
import {changeFriendGroup} from '../../../../api/friendOperation'
export default {
  data(){
    return{
      tableData:this.$store.getters.myFriendList,
      radio:-1,
      currentRow: null,
      friendId: this.$route.params.friendId,
    }
  },
  methods:{
    resetFriendGroup(){
      this.radio = -1;
      this.currentRow = null;
    },
    changeFriendGroup(){
      changeFriendGroup(this.$store.getters.userId, this.friendId, this.currentRow.id).then(res => {
        this.$store.dispatch("GetMyFriendList", this.$store.getters.userId).then(res => {
          this.radio = -1;
          this.currentRow = null;
          this.$toast("移动好友成功")
        })
      })
    },
    handleCurrentChange(id) {
      for (let i = 0; i < this.tableData.length; i++) {
        if (this.tableData[i].id === id) {
          this.currentRow = this.tableData[i];
        }
      }
    },
    onClickLeft(){
      this.$router.push({path:"/friendList"});
    }
  }
}
</script>

<style lang="scss" scoped>
.van-radio-group{
  margin-top:0.2rem
}
.commit{
  width:100%;
  margin-top:0.2rem;
}
.recover{
   width: 100%;
 }
</style>

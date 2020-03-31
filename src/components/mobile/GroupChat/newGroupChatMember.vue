<template>
  <div>
    <van-nav-bar
      title="添加群成员"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      id="head"
    />
    <hr style="margin-top:1.2rem;color:#fff"/>
    <div v-for="(item, ind) in groupFriend" :key="ind" style="margin-bottom:0.2rem">
      <van-card
        :title="item.friendInfo.nickName"
        :thumb="item.friendInfo.avatar"
      >
          <template #footer>
            <van-button type="primary" plain round  @click="appendGroupMember(item.friendId)">添加</van-button>
          </template>
      </van-card>
    </div>
  </div>
</template>

<script>
import { addNewGroupMember } from "../../../api/friendOperation";
export default {
  data(){
    return{
      groupFriend:this.$store.getters.allFriend,
      groupId:this.$route.params.groupId,
    }
  },
  mounted(){
    // console.log(this.groupFriend);
  },
  methods:{
    onClickLeft(){
      this.$router.replace({name: "groupChat", params:{groupNum: this.$route.params.groupNum}});
    },
    appendGroupMember(id){
      addNewGroupMember(this.groupId, id)
        .then(res => {
          this.$toast("添加群成员成功")
        })
        .catch(e => {
          this.$toast("添加群成员失败")
        })
    },
  }
}
</script>

<style>
#head{
  position: -webkit-sticky;
  left: 0rem;
  top: 0rem;
  width: 100%;
}
</style>
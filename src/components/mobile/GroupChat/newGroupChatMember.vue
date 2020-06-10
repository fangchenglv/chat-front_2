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
    <div v-for="(item, ind) in groupFriend" :key="ind" style="margin-bottom:0.2rem ;front-size:30px">
      <van-card>
        <template #thumb>
        <div style="float:left;width:2.5rem; height:2.5rem;background-color:rgba(100,100,100,0.45);margin-top: 0rem;border-radius:50%;">
          <p style="color:  #0c0c0c ;margin-top:0.75rem;font-size:28px">{{item.friendInfo.nickName}}</p>
        </div>
        </template>
          <template #desc>
            <van-button type="primary" style="top:0.6rem ;float:right" plain round  @click="appendGroupMember(item.friendId)">添加</van-button>
          </template>
      </van-card >
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

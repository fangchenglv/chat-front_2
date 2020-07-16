<template>
  <div>
    <van-nav-bar
      title="添加群成员"
      left-text="返回"
      left-arrow
      @click-left="onClickLeft"
      id="head"
    />
    <hr />
    <div v-for="(item, ind) in groupFriend" :key="ind"  class="list">
      <van-card>
        <template #thumb>
        <div class="member" >
          <p >{{item.friendInfo.nickName}}</p>
        </div>
        </template>
          <template #desc>
            <van-button type="primary"  plain round class="add" @click="appendGroupMember(item.friendId)">添加</van-button>
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

<style lang="scss" scoped>
#head{
  position: -webkit-sticky;
  left: 0rem;
  top: 0rem;
  width: 100%;
}
hr{
  margin-top:1.2rem;color:#fff;
}
.list{
  margin-bottom:0.2rem ;front-size:30px ;margin-top: 0.2rem
}
  .member{
    float:left;width:2.5rem; height:2.5rem;background-color:rgba(100,100,100,0.45);margin-top: 0rem;border-radius:50%;
  }
  p{
    color:  #0c0c0c ;margin-top:0.725rem;font-size:27px
  }
  .add{
    top:0.6rem ;float:right
  }
</style>

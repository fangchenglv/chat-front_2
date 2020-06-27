<template>
  <div class="head">
    <div v-for="(item, id) in groupList" :key="id">
      <van-cell
        :title=item.typeName
        :value=item.friends.length
        icon="arrow-down"
        @click="onClickLeft(item.id)"
        style="text-align:left;background-color:rgb(250,250,250)"/>
      <div v-show="show === item.id" v-for="(data, ind) in item.friends" :key="ind">
        <van-cell
          :title="data.friendInfo.nickName"
          @click="toFriend(data.friendId)"
          is-link
          style="text-align:left;border:solid 0.02rem #ddd; border-top:none; border-left:none; border-right:none">
       </van-cell>
      </div>
    </div>
    <div>
      <van-cell
        title="群组"
        :value="myGroupList.length"
        icon="arrow-down"
        @click="onClickLeft(myGroupList.groupNum)"
        style="text-align:left;background-color:rgb(250,250,250)"/>
        <div v-show="show === myGroupList.groupNum" v-for="(data, id) in myGroupList" :key="id">
          <van-cell
            :title="data.groupName"
            @click="toPathGroup(data.groupNum)"
            is-link
            style="text-align:left;border:solid 0.02rem #ddd; border-top:none; border-left:none; border-right:none"/>
        </div>
    </div>

  </div>
</template>

<script>
import {mapGetters} from 'vuex'
import {getMyGroupList} from "../../../api/friendOperation"

export default {
  data(){
    return{
      groupList:[],
      show:-1,
      myGroupList:[],
    }
  },
  mounted() {
    this.init();
    this.getGroupList();
  },
  methods:{
    init(){
      this.$store.dispatch("GetMyFriendList", this.$store.getters.userId).then(res =>{
        this.groupList = this.$store.getters.myFriendList;
      })
    },
    toPathGroup(id){
      this.$router.replace({name: "groupChat", params: {groupNum: id}});
    },
    getGroupList(){
      getMyGroupList(this.$store.getters.userId)
        .then(res => {
          this.myGroupList = res.data.data;
          this.$store.dispatch("GetMyGroupChat", res.data.data);
        })
        .catch((error) => {
          console.log(error);
        })
    },
    onClickLeft(i){
      if(this.show === i){
        this.show = -1;
        return
      }
      this.show = i;

    },
    toFriend(friend){
      this.$router.push({name:"FriendPage", params:{id:friend}});
    }
  }
}
</script>

<style scoped>
.head{
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>

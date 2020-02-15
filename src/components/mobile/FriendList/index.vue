<template>
  <div class="head">
    <div v-for="item in groupList" :key="item.id">
      <van-cell 
        :title=item.typeName 
        :value=item.friends.length 
        icon="arrow-down" 
        @click="onClickLeft(item.id)"
        style="text-align:left;background-color:rgb(250,250,250)"/>
      <div v-show="show === item.id" v-for="data in item.friends" :key="data.friendId">
        <van-cell 
        :icon="data.friendInfo.avatar"
          :title="data.friendInfo.nickName" 
          @click="toFriend(data.friendId)" 
          is-link 
          style="text-align:left;border:solid 0.02rem #ddd; border-top:none; border-left:none; border-right:none"/>
        
      </div>

    </div>
  </div>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  data(){
    return{
      groupList:[],
      show:-1,
    }
  },
  mounted() {
    this.init();
  },
  methods:{
    init(){
      this.$store.dispatch("GetMyFriendList", this.$store.getters.userId).then(res =>{
        this.groupList = this.$store.getters.myFriendList;
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
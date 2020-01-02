<template>
  <div class="head">

  </div>
</template>

<script>
import {mapGetters} from 'vuex'

export default {
  data(){
    return{
      friendList:[],
    }
  },
  mounted() {
    this.init();
  },
  methods:{
    init(){
      this.$store.dispatch("GetMyFriendList", this.$store.getters.userId).then(res =>{
        this.friendList = this.$store.getters.myFriendList;
      })
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
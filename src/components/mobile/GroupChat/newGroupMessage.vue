<template>
  <div>
    <van-nav-bar
        title="更改群信息"
        left-text="返回"
        left-arrow
        @click-left="onClickLeft"
        id="head"
      />
      <van-form @submit="handleChange" class="group-form">
        <van-field
          v-model="form.name"
          name="新的群名"
          label="群名"
          placeholder="新群名"
        />
        <van-field
          v-model="form.descriptor"
          name="新的群描述"
          label="群描述"
          placeholder="新的群描述"
        />
        <div  class="btn-div" >
          <van-button round plain type="info" native-type="submit" class="submit" >
            提交
          </van-button>
          <van-button round plain type="info" native-type="button" @click="handleCancel">
            取消
          </van-button>
        </div>
      </van-form>
  </div>
</template>

<script>
import { changeGroupChatInfo, getMyGroupList } from "../../../api/friendOperation"
export default {
  data(){
    return{
      groupNum: this.$route.params.groupNum,
      form:{       //群的信息吧
        name: "",
        descriptor: "",
        groupId:undefined,
        avatar:"",
      },
      myId:this.$store.getters.userId,
      groupFriend:this.$store.getters.allFriend,
    }
  },
  mounted(){
    this.init();
  },
  computed: {
    groupDetail:function(){
      let data = this.$store.getters.myGroupChat;
      for(let i = 0; i < data.length; i++){
        if(data[i].groupNum === this.groupNum){
          return data[i];
        }
      }
    }
  },
  methods:{
    init(){
      this.form.name = "" + this.groupDetail.groupName;
      this.form.descriptor = "" + this.groupDetail.description;
      this.form.groupId = this.groupDetail.id;
      this.form.avatar = this.groupDetail.avatar;
    },
    onClickLeft(){
      this.$router.replace({name: "groupChat", params:{groupNum: this.$route.params.groupNum}});
    },
    handleChange(){
      if(this.form.name.trim() === ""){
        this.init();
        return
      } else if (this.form.name.trim() === this.groupDetail.groupName && this.form.descriptor === this.groupDetail.description){
        return
      } else {
        changeGroupChatInfo(this.form.groupId, this.form.name, this.form.descriptor)
          .then(res => {
            getMyGroupList(this.myId)
              .then(res => {
                this.$store.dispatch("GetMyGroupChat", res.data.data);
              })
          })
      }
    },
    handleCancel(){
      this.form.name = "" + this.groupDetail.groupName;
      this.form.descriptor = "" + this.groupDetail.description;
      this.show = false;
    },
  }
}
</script>

<style lang="scss">
#head{
  position: absolute;
  left: 0rem;
  top: 0rem;
  width: 100%;
}
.group-form{
    background-color:#fff;margin-top:1.3rem;padding-top:0.5rem;padding-bottom:0.3rem
  }
  .btn-div{
    margin-top:0.5rem;
  }
  .submit{
    margin-right:0.3rem;
  }
</style>

<template>
  <div >
    <el-table
      :data="groupData"
      style="width: 100%">
      <el-table-column
        type="index"
        width="200">
      </el-table-column>
      <el-table-column
        prop="typeName"
        label="分组名称"
        width="250">
      </el-table-column>
      <el-table-column
        prop="friends.length"
        label="好友数"
        width="200">
      </el-table-column>
      <el-table-column
        fixed="right"
        label="操作"
        width="400">
        <template slot-scope="scope">
          <el-button @click="handleClick(scope.row)" type="text" size="small">删除分组</el-button>
          <el-button @click="handleChange(scope.row)" type="text" size="small">修改分组名</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="修改分组名" :visible.sync="dialogFormVisible">
      <el-form :model="newName">
        <el-form-item label="新分组名称" >
          <el-input v-model="newName.name" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="changeName(0)">取 消</el-button>
        <el-button type="primary" @click="changeName(1)">确 定</el-button>
      </div>
    </el-dialog>
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
      row:null,
    }
  },
  computed:{
    groupData:function () {
      const all = this.$store.getters.myFriendList;
      return all;
    }
  },
  methods:{
    handleChange(row){
      this.dialogFormVisible = true;
      this.row = row;
    },
    changeName(code){
      if (code === 0) {
        this.row = null;
        this.newName.name = "";
        this.dialogFormVisible = false;
        return;
      }
      changeFriendGroupName(this.row.id, this.newName.name).then(res => {
        this.$store.dispatch("GetMyFriendList", this.$store.getters.userId).then(res => {});
      })
      this.row = null;
      this.newName.name = "";
      this.dialogFormVisible = false;
    },
    handleClick(row) {
      if (!row) {
        this.row = null;
        this.dialogFormVisible = false;
        return
      }
      deleteFriendGroup(row.id).then(res => {
        this.$store.dispatch("GetMyFriendList", this.$store.getters.userId)
          .then(res => {
          });
      })
    }
  }
}
</script>

<style>

</style>

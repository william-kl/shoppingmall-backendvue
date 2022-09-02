<template>
  <div>
    <el-tree :data="menus" :props="defaultProps" :expand-on-click-node="false" show-checkbox node-key="catId"
      :default-expanded-keys="expandedKey">
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>{{ node.label }}</span>
        <span>

          <el-button v-if="node.level <= 2" type="text" size="mini" @click="() => append(data)">
            Append
          </el-button>
          <el-button type="text" size="mini" @click="() => edit(data)">
            Edit
          </el-button>
          <el-button v-if="node.childNodes.length == 0" type="text" size="mini" @click="() => remove(node, data)">
            Delete
          </el-button>
        </span>
      </span>
    </el-tree>


    <el-dialog :title="title" :visible.sync="dialogVisible" width="30%" :close-on-click-modal="false">
      <el-form :model="category">
        <el-form-item label="分类名称">
          <el-input v-model="category.name" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="category.icon" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="计量单位">
          <el-input v-model="category.productUnit" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="submitData">Confirm</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
//这里可以导入其他文件(比如:组件,工具 js,第三方插件 js,json文件,图片文件等等)
//例如:import 《组件名称》 from '《组件路径》';

export default {
  //import 引入的组件需要注入到对象中才能使用
  components: {},
  props: {},
  data() {
    return {
      title: "",
      dialogType: "",//edit or add
      category: { name: "", parentCid: 0, catLevel: 0, showStatus: 1, sort: 0, catId: null, productUnit: "", icon: "" },
      dialogVisible: false,
      menus: [],
      expandedKey: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    };
  },
  //计算属性 类似于 data 概念
  computed: {},
  //监控 data 中的数据变化
  watch: {},
  //方法集合
  methods: {
    getMenus() {
      this.$http({
        url: this.$http.adornUrl('/product/category/list/tree'),
        method: 'get'
      }).then(({ data }) => {
        console.log("sucessfully get menu data...", data.data)
        this.menus = data.data
      })
    },
    edit(data) {
      console.log("data to be modified", data)
      this.dialogType = "edit"
      this.title = "Edit Category"
      this.dialogVisible = true

      //send request to get the newest data from database before display name(incase other people update it at the same time)
      this.$http({
        url: this.$http.adornUrl(`/product/category/info/${data.catId}`),//dynamic get catId
        method: 'get',
      }).then(({ data }) => {
        //request successfully
        console.log("returned data", data)
        this.category.name = data.data.name;//display name in input when open the dialog
        this.category.catId = data.data.catId;//fill catId
        this.category.icon = data.data.icon;//display icon
        this.category.productUnit = data.data.productUnit;//display productUnit
        this.category.parentCid = data.data.parentCid
        this.category.catLevel = data.data.catLevel
        this.category.sort = data.data.sort
        this.category.showStatus = data.data.showStatus
      })

    },
    append(data) {
      console.log("append", data)
      this.dialogType = "add"
      this.title = "Add Category"
      this.dialogVisible = true
      this.category.parentCid = data.catId
      this.category.catLevel = data.catLevel * 1 + 1

      this.category.name = ""
      this.category.catId = null
      this.category.icon = ""
      this.category.productUnit = ""
      this.category.sort = 0
      this.category.showStatus = 1
    },
    submitData() {
      if (this.dialogType == "add") {
        this.addCategory();
      }
      if (this.dialogType == "edit") {
        this.editCategory();
      }
    },
    editCategory() {
      var { catId, name, icon, productUnit } = this.category;//decompose
      this.$http({
        url: this.$http.adornUrl('/product/category/update'),
        method: 'post',
        data: this.$http.adornData({ catId, name, icon, productUnit }, false) //only send those four of category
      }).then(({ data }) => {
        this.$message({
          message: 'menu edit successfully!',
          type: 'success'
        })

        this.dialogVisible = false//close dialog
        this.getMenus()//refresh
        this.expandedKey = [this.category.parentCid]//expand its parent menu
      });
    }
    ,
    //add level3 category
    addCategory() {
      console.log("category submitted", this.category)
      this.$http({
        url: this.$http.adornUrl('/product/category/save'),
        method: 'post',
        data: this.$http.adornData(this.category, false)
      }).then(({ data }) => {
        this.$message({
          message: 'menu save successfully!',
          type: 'success'
        });
        //close dialog
        this.dialogVisible = false
        this.getMenus()
        this.expandedKey = [this.category.parentCid]
      });
    },

    remove(node, data) {
      var ids = [data.catId]
      this.$confirm(`delete ${data.name} menu?`, '提示', {//confirm before send http request
        confirmButtonText: 'confirm',
        cancelButtonText: 'cancel',
        type: 'warning'
      }).then(() => {
        this.$http({
          url: this.$http.adornUrl('/product/category/delete'),
          method: 'post',
          data: this.$http.adornData(ids, false)
        }).then(({ data }) => {
          this.$message({
            message: 'menu delete successfully!',
            type: 'success'
          });
          //refresh menu
          this.getMenus();
          //set its parent menu expanded
          this.expandedKey = [node.parent.data.catId]
        })
      }).catch(() => {

      })

      console.log("remove", node, data)
    },
  },
  //生命周期 - 创建完成(可以访问当前 this 实例)
  created() {
    this.getMenus();
  },
  //生命周期 - 挂载完成(可以访问 DOM 元素)
  mounted() {

  },
  beforeCreate() { }, //生命周期 - 创建之前
  beforeMount() { }, //生命周期 - 挂载之前
  beforeUpdate() { }, //生命周期 - 更新之前
  updated() { }, //生命周期 - 更新之后
  beforeDestroy() { }, //生命周期 - 销毁之前
  destroyed() { }, //生命周期 - 销毁完成
  activated() { }, //如果页面有 keep-alive 缓存功能,这个函数会触发
}
</script>
<style scoped>
</style>
<template>
  <div class="app-container">
    <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="姓名" width="130" align="center">
        <template slot-scope="scope">
          {{ scope.row.data.name }}
        </template>
      </el-table-column>
      <el-table-column label="单位" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.data.unit }}</span>
        </template>
      </el-table-column>
      <el-table-column label="职位" width="130" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.data.position == 0 ? '单位负责人' : '员工' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="电话" width="150" align="center">
        <template slot-scope="scope">
          {{ scope.row.data.phone }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="权限身份" width="130" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.data.identity | identityFilter">{{ scope.row.data.identity == 0 ? '管理员' : '普通'
          }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="审核状态" width="130" align="center">
        <template slot-scope="scope">
          <el-tag :type="scope.row.data.status | statusFilter">{{ scope.row.data.status == true ? '通过' : '待审核' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="操作" width="180">
        <template slot-scope="scope">
          <div style="display: flex;justify-content: center;">
            <el-button style="margin: 0 5px 0 0;" v-show="!scope.row.data.status" type="warning" size="mini"
              @click="changeStatus({ status: true, _id: scope.row._id })">通过</el-button>
            <el-button style="margin: 0 5px 0 0;" v-show="scope.row.data.status" type="info" size="mini"
              @click="changeStatus({ status: false, _id: scope.row._id })">驳回</el-button>
            <el-button style="margin: 0;" type="danger" size="mini">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import db from '@/api/database';

export default {
  filters: {
    statusFilter(status) {
      const statusMap = {
        true: 'success',
        false: 'danger'
      }
      return statusMap[status]
    },
    identityFilter(identity) {
      const statusMap = {
        0: 'success',
        1: 'warring'
      }
      return statusMap[identity]
    },
  },
  data() {
    return {
      list: null,
      unitList: null,
      listLoading: true
    }
  },
  created() {
    this.fetchData()
    this.fetchUnit()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      db.collection("PERSONNEL")
        .orderBy('data.createTime', 'desc')
        .get()
        .then(res => {
          this.list = res.data
          console.log(this.list, "list")
          this.fetchUnit()
        })
        .catch(err => {
          console.log(err)
        })
    },
    fetchUnit() {
      db.collection("UNIT")
        .get()
        .then(res => {
          this.unitList = res.data
          this.list.forEach(item => {
            let unit = this.unitList.find(unit => unit._id === item.data.unit);
            if (unit) {
              item.data.unit = unit.data.unitName;
            }
          });
          console.log(this.list, "list")
          this.listLoading = false
        })
        .catch(err => {
          console.log(err)
        })
    },
    changeStatus(e) {
      console.log(e)
      this.listLoading = true
      db.collection("PERSONNEL")
        .doc(e._id)
        .update({
          data: {
            status: e.status
          }
        })
        .then(res => {
          console.log(res)
          this.fetchData()
          this.listLoading = false
        })
        .catch(err => {
          console.log(err)
        })
    }
  }
}
</script>

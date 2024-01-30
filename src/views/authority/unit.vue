<template>
  <div class="app-container">
    <el-table v-loading="listLoading" :data="list" element-loading-text="Loading" border fit highlight-current-row>
      <el-table-column align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="单位名称" align="center">
        <template slot-scope="scope">
          {{ scope.row.data.unitName }}
        </template>
      </el-table-column>
      <el-table-column label="负责人姓名" width="130" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.data.head }}</span>
        </template>
      </el-table-column>
      <el-table-column label="负责人电话" width="150" align="center">
        <template slot-scope="scope">
          {{ scope.row.data.unitPhone }}
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
              @click="changeStatus({status:true,_id:scope.row._id})">通过</el-button>
            <el-button style="margin: 0 5px 0 0;" v-show="scope.row.data.status" type="info" size="mini" @click="changeStatus({status:false,_id:scope.row._id})">驳回</el-button>
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
    }
  },
  data() {
    return {
      list: null,
      listLoading: true
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      db.collection("UNIT")
        .get()
        .then(res => {
          console.log(res)
          this.list = res.data
          this.listLoading = false
          console.log(this.list, "this.list")
        })
        .catch(err => {
          console.log(err)
        })
    },
    changeStatus(e) {
      console.log(e)
      this.listLoading = true
      db.collection("UNIT")
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

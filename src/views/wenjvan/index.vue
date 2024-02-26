<template>
  <div class="projects-container">
    <el-table :data="projectList" style="width: 100%" height="76vh" border>
      <el-table-column label="序号" width="60">
        <template slot-scope="scope">
          {{ (currentPage - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="projectId" label="ID号" width="100"></el-table-column>
      <el-table-column prop="number" label="项目编号" width="180"></el-table-column>
      <el-table-column prop="title" label="问卷名称"></el-table-column>
      <el-table-column label="状态" width="120">
        <template slot-scope="scope">
          {{ scope.row.status === 0 ? '进行中' : '暂停' }}
        </template>
      </el-table-column>
      <el-table-column prop="cpi2Complete" label="单价" width="100"></el-table-column>
      <el-table-column prop="maxComplete" label="配额量" width="100"></el-table-column>
      <el-table-column prop="completes" label="完成量" width="100"></el-table-column>
    </el-table>
    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="currentPage" :page-sizes="[10, 20, 30, 40]" :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper" :total="totalProjects" :pager-count="7">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import app from '@/api/appwx';
import { Loading } from 'element-ui';

export default {
  name: 'Projects',
  data() {
    return {
      projectList: [],
      currentPage: 1,
      pageSize: 10,
      totalProjects: 0,
    };
  },
  created() {
    this.fetchProjects();
  },
  methods: {
    async fetchProjects(page = 1) {
      let loadingInstance = Loading.service({ fullscreen: true, text: '加载中...' }); // 开启加载状态
      try {
        const token = localStorage.getItem('wenjvanjiToken');
        const res = await app.callFunction({
          name: "getAuthUrl",
          data: {
            url: `http://i.wenjuanji.com/api/v1/Projects?page=${page}&size=${this.pageSize}&appId=148&searchCateId=1&entryType=1`,
            authorization: `Bearer ${token}`,
          }
        });
        const result = JSON.parse(res.result);
        console.log(result)
        if (result && result.data) {
          this.projectList = result.data.data;
          this.totalProjects = result.data.dataCount;
        } else {
          throw new Error('Failed to fetch project data.');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        loadingInstance.close(); // 关闭加载状态
      }
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.fetchProjects(val);
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.fetchProjects(1); // Reset to first page with new size
    }
  }
};
</script>

<style>
.projects-container {
  margin: 20px;
}

.pagination-container {
  margin-top: 15px;
  text-align: right;
  /* 分页居右显示 */
}
</style>
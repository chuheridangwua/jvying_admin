<template>
  <div>
    <!-- 数据展示表格 -->
    <div style="margin-bottom: 20px; display: flex; flex-wrap: wrap; align-items: center;">
      <el-input placeholder="搜索调查ID" v-model="search.projectId" style="width: calc(20% - 20px); margin: 10px;"></el-input>
      <el-input placeholder="搜索调查编号" v-model="search.projectNumber"
        style="width: calc(20% - 20px); margin: 10px;"></el-input>
      <el-input placeholder="搜索调查名称" v-model="search.projectName"
        style="width: calc(20% - 20px); margin: 10px;"></el-input>
      <el-select v-model="search.status" placeholder="选择状态" style="width: calc(20% - 20px); margin: 10px;">
        <el-option label="成功完成" value="成功完成"></el-option>
        <el-option label="配额满" value="配额满"></el-option>
        <el-option label="被甄别" value="被甄别"></el-option>
      </el-select>
      <el-date-picker v-model="search.completionDateRange" type="daterange" start-placeholder="开始日期"
        end-placeholder="结束日期" range-separator="至" style="width: calc(40% - 20px); margin: 10px;"
        value-format="yyyy-MM-dd">
      </el-date-picker>
      <el-input placeholder="搜索会员ID" v-model="search.memberId" style="width: calc(15% - 20px); margin: 10px;"></el-input>
      <el-input placeholder="搜索手机号码" v-model="search.phoneNumber"
        style="width: calc(15% - 20px); margin: 10px;"></el-input>
      <el-button @click="resetFilters" type="primary" style="margin: 10px;">重置</el-button>
    </div>

    <el-table :data="filteredRows" style="width: 100%" height="70vh" border
      :default-sort="{ prop: '完成时间', order: 'descending' }">
      <el-table-column type="index" label="序号" width="60"></el-table-column>
      <el-table-column prop="调查ID" label="调查ID" width="80"></el-table-column>
      <el-table-column prop="调查编号" label="调查编号" width="110"></el-table-column>
      <el-table-column prop="调查名称" label="调查名称"></el-table-column>
      <el-table-column label="问卷价格" width="80">
        <template slot-scope="scope">
          {{ getProjectPriceByProjectId(scope.row.调查ID) }}元
        </template>
      </el-table-column>
      <el-table-column prop="状态" label="状态" width="80"
        :filters="[{ text: '配额满', value: '配额满' }, { text: '成功完成', value: '成功完成' }, { text: '被甄别', value: '被甄别' }]"
        :filter-method="filterHandler"></el-table-column>
      <el-table-column prop="会员ID" label="会员ID" width="270"></el-table-column>
      <el-table-column prop="手机号码" label="手机号码" width="120"></el-table-column>
      <el-table-column prop="完成时间" label="完成时间" width="160" :sort-orders="['descending', 'ascending']"
        :sortable="true"></el-table-column>
    </el-table>
    <el-dialog title="下载状态" :visible.sync="isDownloadStatusDialogVisible" width="60%"
      :before-close="handleDownloadStatusDialogClose">
      <div style="text-align: center;">
        <ul>
          <li v-for="(status, index) in downloadStatusList" :key="`${status.projectId}-${index}`"
            class="download-status-item">
            项目ID: {{ status.projectId }} - <el-tag :type="status.status === '下载成功' ? 'success' : 'danger'">{{
              status.status }}</el-tag>
            <div v-if="status.error">{{ status.error }}</div>
          </li>
        </ul>
        <div v-if="allDownloadsCompleted">所有进行中问卷数据下载完成</div>
        <el-button v-if="downloadStatusList.some(status => status.status === '下载失败')"
          @click="retryFailedDownloads">重新下载失败的数据</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import app from '@/api/appwx';
import * as XLSX from 'xlsx';
import { Loading } from 'element-ui';

export default {
  data() {
    return {
      rows: [],
      projectDetails: [],
      inactiveProjectDetails: [],
      downloadStatusList: [], // 存储每个文件的下载状态
      isDownloadStatusDialogVisible: false, // 控制下载状态对话框的显示，
      fetchingInfo: true, //表示是否正在获取问卷信息
      allDownloadsCompleted: false,
      search: {
        projectId: '',
        projectNumber: '',
        projectName: '',
        status: '',
        completionDateRange: [],
        memberId: '',
        phoneNumber: '',
        completionDate: '', // 用于绑定日期选择器的模型
      },
    };
  },
  created() {
    this.fetchProjects(); // 调用改动后的fetchProjects
  },
  computed: {
    filteredRows() {
      return this.rows.filter(row => {
        const rowDate = row.完成时间 ? row.完成时间.split(' ')[0] : '';
        const startDate = this.search.completionDateRange[0];
        const endDate = this.search.completionDateRange[1];
        const isDateWithinRange = startDate && endDate ? (rowDate >= startDate && rowDate <= endDate) : true;
        return (
          (this.search.projectId ? row.调查ID.toString().includes(this.search.projectId) : true) &&
          (this.search.projectNumber ? row.调查编号.toString().includes(this.search.projectNumber) : true) &&
          (this.search.projectName ? row.调查名称.toLowerCase().includes(this.search.projectName.toLowerCase()) : true) &&
          (this.search.status ? row.状态.toLowerCase().includes(this.search.status.toLowerCase()) : true) &&
          (this.search.memberId ? row.会员ID.toString().includes(this.search.memberId) : true) &&
          (this.search.phoneNumber ? row.手机号码.toString().includes(this.search.phoneNumber) : true) &&
          (!this.search.completionDate || completionDate === this.search.completionDate) &&// 根据完成日期筛选
          (!this.search.status || row.状态 === this.search.status) &&
          isDateWithinRange
        );
      });
    },
  },
  methods: {
    async fetchProjects() {
      this.fetchingInfo = true; // 开始获取信息
      let loadingInstance = Loading.service({ fullscreen: true, text: '获取问卷信息中...' });
      try {
        const token = localStorage.getItem('wenjvanjiToken');
        const res = await app.callFunction({
          name: "getAuthUrl",
          data: {
            url: `http://i.wenjuanji.com/api/v1/Projects?page=1&size=500&appId=148&searchCateId=1&entryType=1`,
            authorization: `Bearer ${token}`,
          }
        });
        const result = JSON.parse(res.result);
        if (result && result.data && result.data.data) {
          this.projectDetails = result.data.data.map(item => ({
            status: item.status,
            projectId: item.projectId,
            cpi2Complete: item.cpi2Complete
          }));
          // 过滤status为0的项目并存储
          this.inactiveProjectDetails = this.projectDetails.filter(item => item.status === 0);
          console.log('projectDetails:', this.projectDetails); // 在控制台打印status为0的项目详情
          console.log('inactiveProjectDetails:', this.inactiveProjectDetails); // 在控制台打印status为0的项目详情
          this.downloadAllInactiveProjects(); // 下载所有不活跃项目的数据
        } else {
          throw new Error('Failed to fetch project data.');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        loadingInstance.close();
        this.fetchingInfo = false; // 获取完成
        this.showDownloadDialog(); // 显示下载状态对话框
      }
    },
    showDownloadDialog() {
      // 初始化下载状态列表，为每个问卷添加“待下载”状态
      this.downloadStatusList = this.inactiveProjectDetails.map(project => ({
        projectId: project.projectId,
        status: '待下载',
        name: project.name, // 假设问卷信息中包含名称
      }));

      this.isDownloadStatusDialogVisible = true; // 显示下载状态对话框

      // 开始下载
      this.downloadAllInactiveProjects();
    },
    async downloadAllInactiveProjects() {
      this.downloadStatusList = []; // 重置下载状态列表

      if (this.inactiveProjectDetails.length === 0) {
        console.log("No inactive projects to download.");
        return;
      }

      for (let i = 0; i < this.inactiveProjectDetails.length; i++) {
        const project = this.inactiveProjectDetails[i];
        await this.downloadFile(project.projectId); // 异步等待每个文件下载完成
      }

      this.isDownloadStatusDialogVisible = true; // 所有文件下载完成后显示下载状态对话框
      this.allDownloadsCompleted = true; // 设置下载完成标志
    },
    async downloadFile(projectId) {
      try {
        const token = localStorage.getItem('wenjvanjiToken');
        const res = await app.callFunction({
          name: 'getAuthUrl',
          data: {
            url: `http://i.wenjuanji.com/api/v1/Projects/${projectId}/Participations?id=${projectId}&appId=148`,
            authorization: `Bearer ${token}`
          }
        });
        const data = JSON.parse(res.result);
        if (data.data) {
          const downloadUrl = `http://i.wenjuanji.com/api/v1/File/Down?filename=${encodeURIComponent(data.data)}`;
          const fileRes = await app.callFunction({
            name: 'downTable',
            data: {
              url: downloadUrl,
              authorization: `Bearer ${token}`
            }
          });
          const fileData = JSON.parse(fileRes.result);
          if (fileData.base64) {
            const blob = this.base64ToBlob(fileData.base64, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            const reader = new FileReader();
            reader.onload = (e) => {
              const workbook = XLSX.read(e.target.result, { type: 'binary' });
              if (workbook.SheetNames.length > 0) {
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                let json = XLSX.utils.sheet_to_json(worksheet, { raw: false });
                // 确保不添加重复的数据
                const newRows = json.filter(newRow => !this.rows.some(row => row.调查ID === newRow.调查ID));
                this.rows = [...this.rows, ...newRows]; // 使用展开运算符合并数组
                console.log("File processed:", json);
                this.downloadStatusList.push({ projectId: projectId, status: '下载成功' });
              } else {
                throw new Error('No sheets in workbook');
              }
            };
            reader.onerror = (errorEvent) => {
              throw new Error('Error reading file');
            };
            reader.readAsBinaryString(blob);
          } else {
            throw new Error('No base64 data in response');
          }
        } else {
          throw new Error('Failed to obtain download URL');
        }
      } catch (error) {
        console.error('Error downloading and processing file:', error);
        this.downloadStatusList.push({ projectId: projectId, status: '下载失败', error: error.message });
      }
    },
    async retryFailedDownloads() {
      const failedProjects = this.downloadStatusList.filter(status => status.status === '下载失败');
      // 清除旧的失败状态，准备重新下载
      this.downloadStatusList = this.downloadStatusList.filter(status => status.status !== '下载失败');

      for (let project of failedProjects) {
        await this.downloadFile(project.projectId);
      }
    },
    // 根据projectId查找价格的方法，确保projectId类型一致
    getProjectPriceByProjectId(projectId) {
      // 假设表格中的projectId是字符串类型，需要转换为数字进行比较
      const numericProjectId = Number(projectId);
      const project = this.projectDetails.find(project => project.projectId === numericProjectId);
      return project ? project.cpi2Complete : 'N/A'; // 如果找到项目则返回价格，否则显示'N/A'
    },
    base64ToBlob(base64, contentType) {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: contentType });
    },
    // 将Excel的日期（从1900年1月1日起的天数）转换为JS日期对象
    excelDateToJSDate(serialDate) {
      // Excel的基准日期
      const excelEpoch = new Date(1900, 0, 1);
      // 将天数转换为毫秒：Excel文件中的日期是从1900年1月1日开始计算的天数（需要减去2天）
      const jsDate = new Date(excelEpoch.getTime() + (serialDate - 2) * 86400000);
      return jsDate;
    },
    formatDateTime(dateTime) {
      // 格式化日期时间为年月日时分秒
      const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      return dateTime.toLocaleDateString('zh-CN', options).replace(/\//g, '-');
    },
    sortRankChange(item) {
      console.log(item)
    },
    filterHandler(value, row, column) {
      const property = column['property'];
      return row[property] === value;
    },
    handleDownloadStatusDialogClose() {
      this.isDownloadStatusDialogVisible = false;
    },
    // 重置筛选
    resetFilters() {
      this.search = {
        projectId: '',
        projectNumber: '',
        projectName: '',
        status: '',
        completionDateRange: [],
        memberId: '',
        phoneNumber: '',
        completionDate: '',
      };
    },
  }
};
</script>

<style scoped>
.download-status-item {
  margin-bottom: 4px;
  /* 增加列表项之间的间距 */
}</style>


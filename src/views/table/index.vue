<template>
  <div>
    <!-- 数据展示表格 -->
    <el-table :data="rows" style="width: 100%" height="80vh" border :default-sort="{ prop: '完成时间', order: 'descending' }">
      <el-table-column prop="序列" label="序号" sortable width="80"></el-table-column>
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
    <!-- 分页组件 -->
  </div>
</template>

<script>
import app from '@/api/appwx';
import * as XLSX from 'xlsx';
import { Loading } from 'element-ui';

export default {
  data() {
    return {
      rows: [], // 存储处理后的数据
      projectDetails: [],
      inactiveProjectDetails: [], // 存储status为0的项目详情
    };
  },
  created() {
    this.fetchProjects()
    this.downloadFile(26937); // 初始化时下载并处理文件
  },
  methods: {
    async fetchProjects() {
      let loadingInstance = Loading.service({ fullscreen: true, text: '加载中...' }); // 开启加载状态
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
        } else {
          throw new Error('Failed to fetch project data.');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        loadingInstance.close(); // 关闭加载状态
      }
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
        console.log("data", data);
        if (data.success && data.data) {
          const downloadUrl = `http://i.wenjuanji.com/api/v1/File/Down?filename=${encodeURIComponent(data.data)}`;
          const fileRes = await app.callFunction({
            name: 'downTable',
            data: {
              url: downloadUrl,
              authorization: `Bearer ${token}`
            }
          });
          const fileData = JSON.parse(fileRes.result);
          console.log("fileData", fileData);
          if (fileData.base64) {
            console.log("Processing file...");
            const blob = this.base64ToBlob(fileData.base64, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const workbook = XLSX.read(e.target.result, { type: 'binary' });
                if (workbook.SheetNames.length > 0) {
                  const firstSheetName = workbook.SheetNames[0];
                  const worksheet = workbook.Sheets[firstSheetName];
                  let json = XLSX.utils.sheet_to_json(worksheet, { raw: false }); // Use raw: false to get formatted strings for dates
                  this.rows = json;
                  console.log("File processed:", json);
                } else {
                  console.log("No sheets in workbook");
                }
              } catch (error) {
                console.error("Error reading workbook", error);
              }
            };
            reader.onerror = (error) => {
              console.error("Error reading file", error);
            };
            reader.readAsBinaryString(blob);
          } else {
            console.error("No base64 data in response");
          }
        } else {
          console.error("Failed to obtain download URL");
        }
      } catch (error) {
        console.error('Error downloading and processing file:', error);
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
    }
  }
};
</script>

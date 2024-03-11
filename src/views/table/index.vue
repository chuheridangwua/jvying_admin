<template>
  <div>
    <my-loading-indicator :visible="isLoading"></my-loading-indicator>
    <!-- 数据展示表格 -->
    <div style="margin: 20px; display: flex; flex-wrap: wrap; align-items: center;">
      <el-input placeholder="搜索调查ID" v-model="search.projectId"
        style="width: calc(20% - 20px); margin: 10px;"></el-input>
      <el-input placeholder="搜索调查编号" v-model="search.projectNumber"
        style="width: calc(20% - 20px); margin: 10px;"></el-input>
      <el-input placeholder="搜索调查名称" v-model="search.projectName"
        style="width: calc(20% - 20px); margin: 10px;"></el-input>
      <el-select v-model="search.status" placeholder="选择状态" style="width: calc(20% - 20px); margin: 10px;">
        <el-option label="成功完成" value="成功完成"></el-option>
        <el-option label="配额满" value="配额满"></el-option>
        <el-option label="被甄别" value="被甄别"></el-option>
      </el-select>
      <el-input placeholder="搜索会员ID" v-model="search.memberId"
        style="width: calc(15% - 20px); margin: 10px;"></el-input>
      <el-input placeholder="搜索手机号码" v-model="search.phoneNumber"
        style="width: calc(15% - 20px); margin: 10px;"></el-input>
      <el-date-picker v-model="search.selectedDate" type="date" placeholder="选择日期"
        style="width: calc(25% - 20px); margin: 10px;" value-format="yyyy-MM-dd" @change="fetchProjects">
      </el-date-picker>
      <!-- <el-button @click="filterProjectsByDateRange" type="primary" style="margin: 10px;">查找</el-button> -->
      <!-- <el-button @click="resetFilters" type="danger" style="margin: 10px;">重置</el-button> -->
      <el-button @click="showDownloadStatusDialog" type="success" style="margin: 10px;">查看下载状况</el-button>
      <el-button @click="updateSingleDayInfo" type="warning" style="margin: 10px;">更新单日信息</el-button>
      <el-button @click="updateSingleDayInfo" type="warning" style="margin: 10px;">loading-19</el-button>
    </div>

    <el-table :data="filteredRows" style="margin: 0px 20px 10px;width: auto" height="68vh" border
      :default-sort="{ prop: '完成时间', order: 'descending' }">
      <el-table-column type="index" label="序号" width="60"></el-table-column>
      <el-table-column prop="调查ID" label="调查ID" width="100"></el-table-column>
      <el-table-column prop="调查编号" label="调查编号" width="110"></el-table-column>
      <el-table-column prop="调查名称" label="调查名称"></el-table-column>
      <el-table-column label="问卷价格" width="80">
        <template slot-scope="scope">
          {{ getPriceByProjectId(scope.row.调查ID) }}元
        </template>
      </el-table-column>
      <el-table-column prop="状态" label="状态" width="85">

        <template slot-scope="scope">
          <el-tag :type="getStatusTagType(scope.row.状态)">
            {{ scope.row.状态 }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="会员ID" label="会员ID" width="270"></el-table-column>
      <el-table-column prop="手机号码" label="手机号码" width="120"></el-table-column>
      <el-table-column prop="完成时间" label="完成时间" width="160" :sort-orders="['descending', 'ascending']"
        :sortable="true"></el-table-column>
    </el-table>

    <!-- 下载状态对话框 -->
    <el-dialog :visible.sync="isDownloadStatusDialogVisible" width="40%" :before-close="handleDownloadStatusDialogClose"
      style="background-color: white" title="下载状态">
      <el-table :data="downloadStatusList" style="width: 100%" align="center">
        <el-table-column prop="projectId" label="项目ID" width="120"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">

          <template v-slot="scope">
            <el-tag :type="scope.row.status === '下载成功' ? 'success' : 'danger'">
              {{ scope.row.status }}<i class="el-icon-loading" v-if="scope.row.loading"></i>
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="AppID状态" width="100">

          <template v-slot="scope">
            <el-tag v-if="scope.row.appId" :type="getAppIdType(scope.row.appId)">
              {{ scope.row.status === '下载成功' ? getAppIdLabel(scope.row.appId) : '' }}
            </el-tag>
            <el-tag v-else>
              未知
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="error" label="错误信息"></el-table-column>
      </el-table>
      <el-button style="margin-top: 20px;" v-if="downloadStatusList.some(status => status.status === '下载失败')"
        @click="retryFailedDownloads" type="danger">重新下载失败的数据</el-button>
    </el-dialog>
  </div>
</template>

<script>
import app from '@/api/appwx';
import db from '@/api/database';
import MyLoadingIndicator from '../../components/MyLoadingIndicator.vue'
import * as XLSX from 'xlsx';
import { Loading, Message } from 'element-ui';

export default {
  components: {
    MyLoadingIndicator,
  },
  data() {
    return {
      isLoading: false,
      rows: [],
      projectDetails: [],
      projectPrices: {}, // 存储每个项目的价格
      downloadStatusList: [], // 存储每个文件的下载状态
      isDownloadStatusDialogVisible: false, // 控制下载状态对话框的显示，
      fetchingInfo: true, //表示是否正在获取问卷信息
      allDownloadsCompleted: false,
      search: {
        selectedDate: '',
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
    // this.search.selectedDate = this.getYesterdayDate(); // 初始化为昨天的日期
    // this.fetchProjects(); // 组件创建时自动加载昨天的数据
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
    // 用于执行异步操作的方法，显示加载指示器，等待异步操作完成后关闭加载指示器
    async performAsyncOperation(operation) {
      const loadingInstance = this.$loading({
        lock: true,
        text: '正在处理...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });

      try {
        await operation(); // 等待传入的异步操作完成
      } catch (error) {
        console.error("异步操作失败:", error);
        this.$message.error('操作失败'); // 可根据实际需要展示错误信息
      } finally {
        loadingInstance.close(); // 确保加载指示器被关闭
      }
    },

    fetchProjects() {
      console.log('fetchProjects 开始执行');
      // 显示加载中的通知
      this.$notify({
        title: '加载中',
        message: '正在获取项目数据，请稍候...',
        type: 'info',
        duration: 0 // 0 表示不自动关闭
      });

      const newProjectDetails = [];
      const newProjectPrices = {};
      const token = localStorage.getItem('wenjvanjiToken');
      console.log('localStorage 中读取的 token:', token);

      const selectedDate = this.search.selectedDate;
      console.log('selectedDate:', selectedDate);
      if (!selectedDate) {
        console.log('没有选择日期，函数提前返回');
        // 关闭所有通知
        this.$notify.closeAll();
        return;
      }

      let page = 1;
      let processedProjectIds = new Set();

      const fetchPageData = (page) => {
        console.log(`开始处理页面 ${page}`);
        app.callFunction({
          name: "getAuthUrl",
          data: {
            url: `http://i.wenjuanji.com/api/v1/CashLogs?page=${page}&size=30&actionId=0`,
            authorization: `Bearer ${token}`,
          }
        }).then(res => {
          const result = JSON.parse(res.result);
          console.log(`页面 ${page} 的结果:`, result);

          if (result && result.data && result.data.data.length > 0) {
            const earliestDateInBatch = result.data.data[result.data.data.length - 1].dateline.slice(0, 10);
            const hasReachedBeforeSelectedDate = earliestDateInBatch < selectedDate;
            console.log(`页面 ${page} - 最早日期 ${earliestDateInBatch} - 是否已经达到或超过选定日期:`, hasReachedBeforeSelectedDate);

            for (const item of result.data.data) {
              const itemDate = item.dateline.slice(0, 10);
              console.log(`处理项目 - 日期: ${itemDate}, ID: ${item.relationId}`);

              if (itemDate === selectedDate && !processedProjectIds.has(item.relationId)) {
                processedProjectIds.add(item.relationId);
                newProjectDetails.push({ projectId: item.relationId, dateline: itemDate });
                newProjectPrices[item.relationId] = item.cash;
                console.log(`添加项目 ID: ${item.relationId} - 价格: ${item.cash}`);
              }
            }

            if (!hasReachedBeforeSelectedDate) {
              fetchPageData(page + 1); // 递归调用以处理下一页
            } else {
              // 数据处理完成，显示成功通知并关闭加载中的通知
              this.$notify.success({
                title: '成功',
                message: '所有项目数据已成功获取',
                duration: 3000
              });
              this.$notify.closeAll(); // 关闭所有通知，包括加载中的通知
              this.projectDetails = newProjectDetails;
              this.projectPrices = newProjectPrices;
              console.log('所有数据已获取，更新后的 projectDetails 和 projectPrices', this.projectDetails, this.projectPrices);
              this.prepareDownloadStatusList();
            }
          } else {
            console.log('没有更多数据，结束数据获取');
            // 显示成功通知并关闭加载中的通知
            this.$notify.success({
              title: '成功',
              message: '所有项目数据已成功获取',
              duration: 3000
            });
            this.$notify.closeAll(); // 关闭所有通知
            this.projectDetails = newProjectDetails;
            this.projectPrices = newProjectPrices;
          }
        }).catch(error => {
          console.error('fetchProjects 方法中捕获的错误:', error);
          // 显示错误通知并关闭加载中的通知
          this.$notify.error({
            title: '错误',
            message: '操作失败',
            duration: 3000
          });
          this.$notify.closeAll();
        });
      };

      fetchPageData(page);
    },



    prepareDownloadStatusList() {
      this.downloadStatusList = this.projectDetails.map(project => ({
        projectId: project.projectId,
        status: '待下载',
        appId: null,
      }));
      this.isDownloadStatusDialogVisible = true;
      this.downloadAllInactiveProjects(); // 在准备完下载状态列表之后开始下载流程
    },
    filterProjectsByDateRange() {
      const [startDate, endDate] = this.search.completionDateRange;
      const filteredProjects = this.projectDetails.filter(project => {
        const projectDate = project.dateline.split(' ')[0];
        return projectDate >= startDate && projectDate <= endDate;
      });
      // 然后根据filteredProjects中的projectId进行数据下载和渲染
      this.downloadAllInactiveProjects(filteredProjects.map(p => p.projectId));
    },
    showDownloadDialog() {
      // 初始化下载状态列表，为每个问卷添加“待下载”状态
      this.downloadStatusList = this.projectDetails.map(project => ({
        projectId: project.projectId,
        status: '待下载',
        name: project.name, // 假设问卷信息中包含名称
      }));

      this.isDownloadStatusDialogVisible = true; // 显示下载状态对话框

      // 开始下载
      this.downloadAllInactiveProjects();
    },

    async downloadAllInactiveProjects() {
      const BATCH_SIZE = 5; // 一次处理的项目数量
      let index = 0;

      const updateUI = async () => {
        if (index >= this.downloadStatusList.length) {
          this.allDownloadsCompleted = true;
          this.$message({
            message: '所有文件下载完成',
            type: 'success',
          });
          return;
        }

        const nextIndex = Math.min(index + BATCH_SIZE, this.downloadStatusList.length);
        const currentBatch = this.downloadStatusList.slice(index, nextIndex);

        const promises = currentBatch.map(project => this.downloadFile(project.projectId));
        await Promise.all(promises);

        // 一批处理完成后，异步更新UI
        this.$nextTick(() => {
          console.log('Batch completed, UI updated');
        });

        index += BATCH_SIZE;
        setTimeout(updateUI, 0); // 使用setTimeout来异步调用updateUI，避免阻塞UI线程
      };

      updateUI(); // 开始批量处理
    },

    async downloadFile(projectId) {
      this.updateDownloadStatus(projectId, '正在下载', null, null, true);

      const token = localStorage.getItem('wenjvanjiToken');
      const appIds = [148, 381]; // 尝试的 appId 列表
      let success = false; // 标记是否成功下载文件

      for (const appId of appIds) {
        if (success) break; // 如果已经成功下载，则跳出循环

        try {
          const res = await app.callFunction({
            name: 'getAuthUrl',
            data: {
              url: `http://i.wenjuanji.com/api/v1/Projects/${projectId}/Participations?id=${projectId}&appId=${appId}`,
              authorization: `Bearer ${token}`
            }
          });
          console.log('res:', res);
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
                  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                  let jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

                  console.log("jsonData:", jsonData);

                  // 只处理符合选定日期的数据
                  jsonData = jsonData.filter(row => row['完成时间'].startsWith(this.search.selectedDate));

                  if (jsonData.length > 0) {
                    // 确保将处理后的数据添加到rows数组中
                    this.rows = [...this.rows, ...jsonData];
                    console.log("File processed:", this.search.selectedDate, jsonData);
                    success = true; // 标记下载成功
                    this.updateDownloadStatus(projectId, '下载成功', null, appId, false); // 更新下载成功状态
                  } else {
                    success = true; // 标记下载成功
                    // 如果没有符合条件的数据，也更新状态为成功，因为下载并处理文件本身没有出错
                    this.updateDownloadStatus(projectId, '下载成功', '奖励数据不做结算', appId, false); // 更新下载成功状态
                  }
                }
              };

              reader.onerror = (error) => {
                console.error('Error reading file:', error);
                this.updateDownloadStatus(projectId, '下载失败', error.toString(), appId, false);
              };

              reader.readAsBinaryString(blob);
              await new Promise(resolve => reader.onloadend = resolve); // 确保文件读取和处理完毕
            } else {
              success = true; // 标记下载成功
              // 如果没有base64数据，直接标记为下载失败
              this.updateDownloadStatus(projectId, '下载失败', '文件数据不存在', null, false);
            }

          }
        } catch (error) {
          success = true; // 标记下载成功
          console.error(`Error trying with appId=${appId} for projectId=${projectId}:`, error);
          this.updateDownloadStatus(projectId, '下载失败', error.toString(), appId, false);
        }
      }

      if (!success) {
        // 如果所有尝试都失败，更新状态为下载失败
        this.updateDownloadStatus(projectId, '下载失败', '所有appId尝试失败', null, false);
      }
    },

    // retryFailedDownloads 方法
    async retryFailedDownloads() {
      const failedProjects = this.downloadStatusList.filter(status => status.status === '下载失败');

      for (let project of failedProjects) {
        await this.downloadFile(project.projectId).catch(error => {
          console.error(`Retry download failed for projectId=${project.projectId}:`, error);
          this.$message.error(`重新下载失败的数据时出现错误: ${error.toString()}`);
        });
      }

      // 检查是否还有下载失败的项目，以更新下载状态
      const stillFailedProjects = this.downloadStatusList.filter(status => status.status === '下载失败');
      if (stillFailedProjects.length === 0) {
        this.allDownloadsCompleted = true; // 更新所有下载完成的状态
        this.$message({
          message: '所有文件下载完成',
          type: 'success',
        });
      }
    },



    // 更新下载状态的方法，现在支持 loading 参数
    updateDownloadStatus(projectId, status, error = null, appId = null, loading = false) {
      this.downloadStatusList = this.downloadStatusList.map(item => {
        if (item.projectId === projectId) {
          return { ...item, status, error, appId, loading };
        }
        return item;
      });
    },

    // 根据projectId查找价格的方法，确保projectId类型一致
    getProjectPriceByProjectId(projectId) {
      // 假设表格中的projectId是字符串类型，需要转换为数字进行比较
      const numericProjectId = Number(projectId);
      const project = this.projectDetails.find(project => project.projectId === numericProjectId);
      return project ? project.cpi2Complete : 'N/A'; // 如果找到项目则返回价格，否则显示'N/A'
    },
    // 将base64字符串转换为Blob对象
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
    formatDate(date) {
      let month = '' + (date.getMonth() + 1),
        day = '' + date.getDate(),
        year = date.getFullYear();

      if (month.length < 2)
        month = '0' + month;
      if (day.length < 2)
        day = '0' + day;

      return [year, month, day].join('-');
    },
    sortRankChange(item) {
      console.log(item)
    },
    filterHandler(value, row, column) {
      const property = column['property'];
      return row[property] === value;
    },
    // 重置筛选时，也需要清除数据
    resetFilters() {
      // 清空现有数据和搜索条件
      this.rows = [];
      this.projectDetails = [];
      this.projectPrices = {};
      this.downloadStatusList = [];

      // 重置搜索条件为初始状态
      this.search = {
        selectedDate: this.getYesterdayDate(), // 重置为昨天的日期
        projectId: '',
        projectNumber: '',
        projectName: '',
        status: '',
        memberId: '',
        phoneNumber: '',
      };

      // 重新获取数据
      this.fetchProjects();
    },

    async updateSingleDayInfo() {
      // let loadingInstance = Loading.service({ fullscreen: true, text: '正在更新数据...' });
      this.isLoading = true;

      // 为每条数据添加price字段和settlementStatus字段
      const updatedRows = this.rows.map(row => ({
        ...row,
        price: this.projectPrices[row.调查ID] || 'N/A', // 假设projectPrices是一个存储了项目ID对应价格的对象
        settlementStatus: false // 默认所有问卷的结算状态为false
      }));

      const date = this.search.selectedDate; // 当前选定的日期
      const totalSurveys = updatedRows.length; // 当日完成问卷的总数
      const statusCounts = updatedRows.reduce((acc, row) => {
        acc[row.状态] = (acc[row.状态] || 0) + 1;
        return acc;
      }, {});
      const participantCount = new Set(updatedRows.map(item => item.手机号码)).size; // 参与人数（不同手机号的个数）

      const updateData = {
        date,
        totalSurveys,
        statusCounts,
        participantCount,
        rows: updatedRows // 包含price字段和settlementStatus字段的问卷数据列表
      };

      try {
        const existingData = await db.collection("settlementData").where({ "data.date": date }).get();
        if (existingData.data.length > 0) {
          const recordId = existingData.data[0]._id;
          await db.collection("settlementData").doc(recordId).update({
            data: updateData
          });
          this.$message.success('当日信息已更新');
        } else {
          await db.collection("settlementData").add({
            data: updateData
          });
          this.$message.success('当日信息已添加');
        }
      } catch (error) {
        console.error('更新单日信息出错:', error);
        this.$message.error('数据更新失败');
      } finally {
        // loadingInstance.close();
        this.isLoading = false;
      }
    },

    getYesterdayDate() {
      const today = new Date();
      const yesterday = new Date(today.setDate(today.getDate() - 1));
      return yesterday.toISOString().split('T')[0]; // 返回格式为'YYYY-MM-DD'
    },
    getPriceByProjectId(projectId) {
      // 根据projectId返回价格
      return this.projectPrices[projectId] || 'N/A';
    },
    getAppIdType(appId) {
      // 根据appId返回标签类型
      return appId === 148 ? 'success' : 'info';
    },
    getAppIdLabel(appId) {
      if (!appId) return '未知'; // 如果appId未定义，返回"未知"
      return appId === 148 ? '国内' : '海外';
    },
    handleDownloadStatusDialogClose() {
      this.isDownloadStatusDialogVisible = false;
    },
    showDownloadStatusDialog() {
      this.isDownloadStatusDialogVisible = true;
    },
    getStatusTagType(status) {
      switch (status) {
        case '成功完成':
          return 'success';
        case '配额满':
          return 'info';
        case '被甄别':
          return 'danger';
        default:
          return '';
      }
    },
  }
};
</script>

<style scoped>
.download-status-item {
  margin-bottom: 4px;
  /* 增加列表项之间的间距 */
}
</style>

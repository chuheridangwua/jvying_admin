<template>
  <div>
    <div style="margin-top: 20px; margin-left: 30px;">
      <!-- Input for price adjustment percentage -->
      <el-input-number v-model="pricePercentage" :min="0" :max="100" label="价格百分比：" />
      <!-- Date picker for selecting date -->
      <el-date-picker v-model="selectedDate" type="date" placeholder="选择日期" format="yyyy 年 MM 月 dd 日"
        value-format="yyyy-MM-dd" style="margin-bottom: 20px; margin-left: 10px;">
      </el-date-picker>
      <!-- Button to fetch data -->
      <el-button @click="fetchDataByDate" type="primary" style="margin-left: 10px;">查找</el-button>
      <!-- Button to adjust price and generate settlement data -->
      <el-button @click="adjustPriceAndGenerateSettlementData" type="primary" style="margin-left: 10px;"
        v-if="!isSettlementData">确认修改价格百分比并生成结算单</el-button>
      <!-- Button to download valid settlement data -->
      <el-button v-if="isSettlementData" @click="downloadValidDataExcel" type="success"
        style="margin-top: 20px;">下载有效结算单</el-button>
      <!-- Button to download invalid data -->
      <el-button v-if="dataWithoutAccountInfo.length > 0" @click="downloadInvalidDataExcel" type="danger"
        style="margin-top: 20px; margin-left: 10px;">下载无效数据</el-button>
    </div>

    <!-- Table for valid settlement data -->
    <div v-if="isSettlementData && mergedSettlementData.length > 0" style="margin-left: 30px;">
      <el-table :data="settlementDataWithInfo" border style="width: 100%; margin-top: 20px;">
        <el-table-column type="index" label="序号（必填）" width="120"></el-table-column>
        <el-table-column prop="收款方支付宝账号" label="收款方支付宝账号（必填）" width="200"></el-table-column>
        <el-table-column prop="收款方姓名" label="收款方姓名（必填）" width="180"></el-table-column>
        <el-table-column prop="金额" label="金额（必填，单位：元）" width="180"></el-table-column>
        <el-table-column prop="备注" label="备注（选填）">
          <template v-slot="scope">
            {{ selectedDate + '——问卷结算——' + scope.row['备注'] }}
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- Table for invalid data -->
    <div v-if="dataWithoutAccountInfo.length > 0" style="margin-left: 30px;">
      <h3>无效数据</h3>
      <el-table :data="dataWithoutAccountInfoTable" border style="width: 100%; margin-top: 20px;">
        <el-table-column type="index" label="序号" width="50"></el-table-column>
        <el-table-column prop="调查ID" label="调查ID" width="100"></el-table-column>
        <el-table-column prop="price" label="价格" width="100"></el-table-column>
        <el-table-column prop="状态" label="状态" width="100"></el-table-column>
        <el-table-column prop="手机号码" label="问卷手机号" width="130"></el-table-column>
        <!-- Removed columns for settlement name and phone number -->
      </el-table>
    </div>

    <!-- 默认情况下显示的原始数据表格 -->
    <el-table v-else :data="filteredData" style="width: 100%; margin: 20px 30px;" border
      :default-sort="{ prop: '问卷手机号', order: 'descending' }">
      <el-table-column type="index" label="序号" width="50"></el-table-column>
      <el-table-column prop="调查ID" label="调查ID" width="100">

        <template slot-scope="scope">
          {{ scope.row['调查ID'] }}
        </template>
      </el-table-column>
      <el-table-column prop="price" label="价格" width="100">

        <template slot-scope="scope">
          <el-tag>{{ scope.row.price }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="状态" label="状态" width="120">

        <template slot-scope="scope">
          <el-tag type="success">{{ scope.row['状态'] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="结算状态" width="120">

        <template slot-scope="scope">
          <el-tag :type="getTagType(scope.row.settlementStatus)">
            {{ scope.row.settlementStatus ? '已结算' : '未结算' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="问卷手机号" label="问卷手机号" width="130">

        <template slot-scope="scope">
          {{ scope.row.手机号码 }}
        </template>
      </el-table-column>
      <el-table-column label="结算姓名" width="130">

        <template slot-scope="scope">
          <div v-if="getPayName(scope.row.手机号码)">{{ getPayName(scope.row.手机号码) }}</div>
          <el-tag v-else type="danger">无信息</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="结算手机号" width="130">

        <template slot-scope="scope">
          <div v-if="getPayPhone(scope.row.手机号码)">{{ getPayPhone(scope.row.手机号码) }}</div>
          <el-tag v-else type="danger">无信息</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { Loading, Message } from 'element-ui';
import db from '@/api/database'; // 替换为你的数据库引入
import * as XLSX from 'xlsx'; // 导入 xlsx 库

export default {
  data() {
    return {
      selectedDate: this.getYesterdayDate(),
      pricePercentage: 100, // Default to 100%
      settlementData: [],
      filteredData: [],
      userData: [],
      mergedSettlementData: [],
      dataWithoutAccountInfo: [], // 新增属性，用于存储没有账号信息的数据
      loading: false,
      noSettlementData: false,
      isSettlementData: false,
    };
  },
  mounted() {
    this.getData();
  },
  methods: {
    downloadValidDataExcel() {
      const titleRow = ['支付宝批量付款文件模板（前面两行请勿删除）'];
      const headerRow = ['序号（必填）', '收款方支付宝账号（必填）', '收款方姓名（必填）', '金额（必填，单位：元）', '备注（选填）'];
      const dataRows = this.settlementDataWithInfo.map((item, index) => [
        index + 1,
        item['收款方支付宝账号'],
        item['收款方姓名'],
        item['金额'].toFixed(2), // 直接使用调整后的金额，不再应用百分比
        `${this.selectedDate}——问卷结算——${item.备注}`
      ]);

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet([titleRow, headerRow, ...dataRows]);

      worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headerRow.length - 1 } }];
      XLSX.utils.book_append_sheet(workbook, worksheet, '有效结算单');
      XLSX.writeFile(workbook, `有效结算单_${this.selectedDate}.xlsx`);
    },
    downloadInvalidDataExcel() {
      const headerRow = ['序号', '调查ID', '价格', '状态', '问卷手机号', '结算状态'];
      const dataRows = this.dataWithoutAccountInfo.map((item, index) => [
        index + 1,
        item['调查ID'],
        item['price'].toFixed(2), // 保留两位小数
        item['状态'],
        item['手机号码'],
        this.getTagType(item['结算状态']) === 'success' ? '已结算' : '未结算',
      ]);

      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);

      XLSX.utils.book_append_sheet(workbook, worksheet, '无效数据');
      XLSX.writeFile(workbook, `无效数据_${this.selectedDate}.xlsx`);
    },
    adjustPriceAndGenerateSettlementData() {
      // First, adjust the prices in filteredData
      this.filteredData = this.filteredData.map(item => {
        return {
          ...item,
          price: (item.price * this.pricePercentage) / 100
        };
      });
      // Then, generate the settlement data
      this.generateSettlementData();
    },
    getData() {
      this.loading = true;
      db.collection('settlementData')
        .where({
          'data.date': this.selectedDate
        })
        .get()
        .then(res => {
          this.settlementData = res.data[0].data.rows;
          this.filterData();
          this.loading = false;
          Message.success('数据加载成功');
        })
        .catch(err => {
          console.error('Error getting data: ', err);
          this.loading = false;
          Message.error('数据加载失败');
        });
    },
    filterData() {
      this.filteredData = this.settlementData.filter(item => item.状态 == '成功完成');
      console.log(this.filteredData, 'this.filteredData');
      this.getUserData();
    },
    generateSettlementData() {
      this.isSettlementData = true;
      const mergedData = {};
      this.dataWithoutAccountInfo = [];

      this.filteredData.forEach(item => {
        const key = item.手机号码;
        const payPhone = this.getPayPhone(key);
        const payName = this.getPayName(key);

        if (!payPhone || !payName) {
          // 如果没有收款方支付宝账号或姓名，加入到不完整数据集
          this.dataWithoutAccountInfo.push(item);
        } else {
          // 如果有，则合并到结算单数据
          if (!mergedData[key]) {
            mergedData[key] = {
              手机号码: key,
              收款方支付宝账号: payPhone,
              收款方姓名: payName,
              金额: parseFloat(item.price),
              备注: item['调查ID']
            };
          } else {
            mergedData[key].金额 += parseFloat(item.price);
            mergedData[key].备注 += `,${item['调查ID']}`;
          }
        }
      });

      this.mergedSettlementData = Object.values(mergedData);
      this.noSettlementData = this.mergedSettlementData.length === 0;
    },
    getTagType(status) {
      return status ? 'success' : 'danger';
    },
    getUserData() {
      db.collection('users')
        .get()
        .then(res => {
          console.log(res, 'res');
          this.userData = res.data;
        })
        .catch(err => {
          console.error('Error getting user data: ', err);
        });
    },
    getPayName(phone) {
      const user = this.userData.find(user => user.data.wenjvan === phone);
      return user ? user.data.payname : '';
    },
    getPayPhone(phone) {
      const user = this.userData.find(user => user.data.wenjvan === phone);
      return user ? user.data.payphone : '';
    },
    summarizeAmount(items) {
      return items.reduce((total, item) => total + item.金额, 0);
    },
    downloadExcel() {
      try {
        const titleRow = ['支付宝批量付款文件模板（前面两行请勿删除）']; // 第一行标题
        const headerRow = ['序号（必填）', '收款方支付宝账号（必填）', '收款方姓名（必填）', '金额（必填，单位：元）', '备注（选填）']; // 第二行列标题
        // 注意这里，只映射你需要的属性，不包括第二列和最后一列的数据
        const dataRows = this.settlementDataWithInfo.map((item, index) => [index + 1, item['收款方支付宝账号'], item['收款方姓名'], item['金额'], item['备注']]);

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([titleRow, headerRow, ...dataRows]);

        // 合并第一行的单元格
        worksheet['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headerRow.length - 1 } }];

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        XLSX.writeFile(workbook, 'settlement_data.xlsx');
      } catch (error) {
        console.error('Error downloading Excel:', error);
        Message.error('下载 Excel 文件时出错！');
      }
    },
    // 方法来计算昨天的日期
    getYesterdayDate() {
      const yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
      return yesterday.toISOString().split('T')[0];
    },
    // 用来根据 selectedDate 获取数据的新方法
    fetchDataByDate() {
      // 清空数据和状态
      this.settlementData = [];
      this.filteredData = [];
      this.mergedSettlementData = [];
      this.dataWithoutAccountInfo = [];
      this.isSettlementData = false;
      this.noSettlementData = false;

      // 根据选择的日期从数据库获取数据
      this.loading = true;
      db.collection('settlementData')
        .where({ 'data.date': this.selectedDate })
        .get()
        .then(res => {
          this.settlementData = res.data[0].data.rows;
          this.filterData();
          this.loading = false;
          Message.success('数据加载成功');
        })
        .catch(err => {
          this.loading = false;
          Message.error('数据加载失败');
        });
    },
    mergeCell({ row, column, rowIndex, columnIndex }) {
      // 如果是第一行，合并第一行的五列
      if (rowIndex === 0) {
        return [1, 5]; // 合并第一行的所有列
      }
      // 其他行不合并，返回 null 或者 undefined
    }
  },
  computed: {
    settlementDataWithInfo() {
      if (!this.isSettlementData) {
        return this.filteredData;
      }
      // 只返回有有效账号信息的数据
      return this.mergedSettlementData.map((item, index) => ({
        ...item,
        '序号（必填）': index + 1,
        '备注（选填）': `${this.selectedDate}——问卷结算——${item.备注}`
      }));
    },
    dataWithoutAccountInfoTable() {
      // 这里将返回没有账户信息的数据数组，用于显示在下方表格中
      return this.dataWithoutAccountInfo;
    }
  }

};
</script>

<style scoped>
/* 根据需要添加样式 */
</style>

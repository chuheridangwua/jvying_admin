<template>
  <div>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="data.name" label="姓名"></el-table-column>
      <el-table-column prop="data.phone" label="电话"></el-table-column>
      <el-table-column prop="data.school" label="学校"></el-table-column>
      <el-table-column prop="data.education" label="学历"></el-table-column>
      <el-table-column label="审核状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.data.isAuditing" type="success">已审核</el-tag>
          <el-tag v-else type="danger">未审核</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="通过状态">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.data.satuts" type="success">已通过</el-tag>
          <el-tag v-else type="danger">未通过</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">

        <template slot-scope="scope">
          <el-button type="text" @click="viewDetails(scope.row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog :visible.sync="detailsDialogVisible" width="60%">
      <div v-if="userDetails.data" style="margin: 20px;">
        <p>ID: <el-tag type="info">{{ userDetails._id }}</el-tag></p>
        <p>姓名: <el-tag type="success">{{ userDetails.data.name }}</el-tag></p>
        <p>电话: <el-tag type="success">{{ userDetails.data.phone }}</el-tag></p>
        <p>密码: <el-tag>{{ userDetails.data.password }}</el-tag></p>
        <p>邮箱: <el-tag>{{ userDetails.data.email }}</el-tag></p>
        <p>学校：<el-tag type="warning">{{ userDetails.data.school }}</el-tag></p>
        <p>学历：<el-tag type="warning">{{ userDetails.data.education }}</el-tag></p>
        <div style="display: flex; align-items: center;">
          <p style="margin-right: 10px;">学生证照片:</p>
          <img :src="imagesUrls[userDetails.data.studentPhoto]" alt="学生证照片" style="width: auto; height: 100px;" />
        </div>
        <div style="display: flex; align-items: center;">
          <p style="margin-right: 10px;">身份证照片:</p>
          <img :src="imagesUrls[userDetails.data.idPhoto]" alt="身份证照片" style="width: auto; height: 100px;" />
        </div>
        <p>英语等级：<el-tag>{{ userDetails.data.englishLevel }}</el-tag></p>
        <div style="display: flex; align-items: center;">
          <p style="margin-right: 10px;">英语等级照片:</p>
          <img :src="imagesUrls[userDetails.data.englishLevelPhoto]" alt="英语等级照片" style="width: auto; height: 100px;" />
        </div>
        <p>教师资格证: <el-tag :type="userDetails.data.teacherQualification ? 'success' : 'danger'">{{
      userDetails.data.teacherQualification ? '有' : '无' }}</el-tag></p>
        <div style="display: flex; align-items: center;">
          <p style="margin-right: 10px;">教师资格证照片:</p>
          <img :src="imagesUrls[userDetails.data.teacherQualificationPhoto]" alt="教师资格证照片"
            style="width: auto; height: 100px;" />
        </div>
        <p>审核状态: <el-tag v-if="userDetails.data.isAuditing" type="success">已审核</el-tag><el-tag v-else
            type="danger">未审核</el-tag>
        </p>
        <p>历史审核意见: <el-tag type="danger" v-if="userDetails.data.auditingMessage.length>0">{{userDetails.data.auditingMessage}}</el-tag>
        </p>
        <p>通过状态: <el-tag v-if="userDetails.data.satuts" type="success">已通过</el-tag><el-tag v-else
            type="danger">未通过</el-tag>
        </p>
        <div>
          <h3>提现信息</h3>
          <p>提现人姓名: <el-tag>{{ userDetails.data.pay.payName }}</el-tag></p>
          <p>支付宝手机号: <el-tag>{{ userDetails.data.pay.payPhone }}</el-tag></p>
        </div>
        <div>
          <h3>任务列表详情</h3>
          <el-table :data="userDetails.data.taskListDetails" style="width: 100%">
            <el-table-column prop="getTime" label="接单任务时间"></el-table-column>
            <el-table-column prop="taskId" label="任务ID"></el-table-column>
            <el-table-column prop="completionQuantity" label="完成数量"></el-table-column>
            <el-table-column prop="amountDisbursed" label="已结算金额"></el-table-column>
            <el-table-column prop="amountPending" label="未结算金额"></el-table-column>
          </el-table>
        </div>
        <div>
          <h3>其他证书</h3>
          <el-row style="flex-direction: column;">
            <el-col v-for="(photo, index) in userDetails.data.elsePhoto" :key="index" style="margin-bottom: 10px;">
              <el-image style="width: auto; height: 100px;" :src="imagesUrls[photo]" fit="cover"></el-image>
            </el-col>
          </el-row>
        </div>
        <div>
          <el-input type="textarea" placeholder="请输入审核意见" v-model="auditingMessage">
          </el-input>
        </div>
        <div style="margin-top: 20px; display: flex; justify-content: center;">
          <el-button type="success" @click="approveUser(true)">通过审核</el-button>
          <el-button type="danger" @click="approveUser(false)">驳回审核</el-button>
        </div>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import db from '@/api/database';
import app from '@/api/appwx';

export default {
  data() {
    return {
      tableData: [], // 用于存储从数据库获取的数据
      detailsDialogVisible: false, // 控制详情模态框的显示
      userDetails: {}, // 存储被点击行的用户详情
      imagesUrls: {}, // 存储图片的临时URL
      auditingMessage: '', // 审核意见
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      db.collection("user").get()
        .then(res => {
          this.tableData = res.data; // 假设res.data是包含所有用户数据的数组
          console.log(res);
        })
        .catch(err => {
          console.error("获取数据失败:", err);
        });
    },
    viewDetails(row) {
      this.userDetails = row; // 设置被点击行的用户详情
      this.detailsDialogVisible = true; // 显示详情模态框
    },
    async viewDetails(row) {
      this.userDetails = row; // 设置被点击行的用户详情
      // 构建文件ID数组
      const fileIDs = [
        this.userDetails.data.studentPhoto,
        this.userDetails.data.idPhoto,
        this.userDetails.data.teacherQualificationPhoto,
        this.userDetails.data.englishLevelPhoto,
        ...this.userDetails.data.elsePhoto,
      ];
      // 获取临时URL
      try {
        const downloadRes = await app.getTempFileURL({
          fileList: fileIDs,
        });
        // 处理返回的临时URL
        this.imagesUrls = downloadRes.fileList.reduce((acc, file) => {
          acc[file.fileID] = file.tempFileURL;
          return acc;
        }, {});
      } catch (error) {
        console.error("获取临时URL失败：", error);
      }
      this.detailsDialogVisible = true; // 显示详情模态框
    },
    approveUser(isApproved) {
      if (!this.userDetails._id) return;

      db.collection("user").doc(this.userDetails._id).update({
        data: {
          satuts: isApproved, // 审核通过或驳回
          isAuditing: true, // 标记为已审核
          auditingMessage: this.auditingMessage, // 审核意见
        }
      })
        .then(() => {
          this.$message.success(isApproved ? '审核通过成功' : '审核驳回成功');
          this.detailsDialogVisible = false;
          this.fetchData(); // 重新加载数据
          this.auditingMessage = ''; // 清空审核意见
        })
        .catch(err => {
          console.error("审核操作失败:", err);
          this.$message.error('审核操作失败');
        });
    },
  }
};
</script>

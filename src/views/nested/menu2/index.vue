<template>
  <div>
    <button @click="downloadFile">Download File123</button>
    <button @click="api">Download Fileapi</button>
    <button @click="login">login</button>
    <img :src="captchaImageUrl" alt="Captcha" />
    <input type="text" v-model="captcha" placeholder="请输入验证码">
    <!-- <iframe id="backend-iframe" src="http://www.wenjuanji.com/login?loginType=3"
      style="width:600px; height:400px;"></iframe> -->
    <table v-if="rows && rows.length > 0">
      <thead>
        <tr>
          <th v-for="(header, index) in headers" :key="index">
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in rows" :key="rowIndex">
          <td v-for="(cell, cellIndex) in row" :key="cellIndex">
            {{ cell }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

import * as XLSX from 'xlsx';

export default {
  data() {
    return {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MjUiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1lIjoiODM4NTgzOTY5QHFxLmNvbSIsImlhdCI6IjIwMjQvMi8yMyAxMjoxNzo1OCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvZXhwaXJhdGlvbiI6IjIwMjQvMi8yMyAxMzoxNzo1OCIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IkNoYW5uZWwiLCJuYmYiOjE3MDg2NjE4NzgsImV4cCI6MTcwODY2NTQ3OCwiaXNzIjoiV2VuanVhbmppIiwiYXVkIjoid3IifQ.7H1iU68MvA2kDpKlrOs-5jqiXzpW-Wo3FxXIUIGvnx8',
      baseUrl: 'http://i.wenjuanji.com', // 基础URL
      captchaImageUrl: '',
      captcha: '',
      captchaId: '',

      headers: [], // 表格头部
      rows: [], // 表格行数据
    };
  },
  mounted() {
    // 监听来自iframe的消息
    window.addEventListener('message', function (event) {
      // if (event.origin === "https://example.com") { // 确保消息来自您信任的域
      console.log('Received token:', event.data);
      // 在这里处理token，比如显示在页面上
      // }  
    }, false);
    // 组件挂载后立即获取验证码
    this.fetchCaptcha();
  },
  methods: {
    async fetchCaptcha() {
      try {
        // 发送GET请求获取验证码图片
        const response = await fetch(`/api/api/v1/Captcha/Image`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Authorization': 'Bearer ' + this.token,
          }
        });

        // 假设API响应的内容是直接的图像数据
        const data = await response.json();
        console.log('fetching captcha:', data);
        console.log('fetching captcha:', data.data);

        // 假设data中包含了base64编码的图像数据
        this.captchaImageUrl = 'data:image/png;base64,' + data.data.base64;
        this.captchaId = data.data.id;
      } catch (error) {
        console.error('Error fetching captcha:', error);
      }
    },
    async login() {
      try {
        const queryParams = new URLSearchParams({
          name: "838583969@qq.com",
          password: "wenjuanji1",
          captchaId: this.captchaId,
          captcha: this.captcha
        });

        const response = await fetch(`${this.baseUrl}/api/v1/Login?${queryParams.toString()}`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            // 如果API不需要在请求头中指定Content-Type为application/json，则不必添加
            //'Content-Type': 'application/json',
            // 添加任何其他必要的请求头
          }
          // 不需要body因为您的数据在URL查询参数中
        });

        const data = await response.json();
        console.log('Token:', data); // 假设token在JSON响应的'token'字段中
        console.log('Token:', data.data.token); // 假设token在JSON响应的'token'字段中
        this.token = data.data.token;

      } catch (error) {
        console.error('Error during login:', error);
      }
    },


    async api() {
      try {
        console.log("Requesting download URL...");
        const response = await fetch(`http://i.wenjuanji.com/api/v1/CashLogs?page=1&size=10&actionId=0`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + this.token,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Network response was not ok.');
        const data = await response.json();
        console.log("Received data:", data);
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    },

    async downloadFile() {
      try {
        // 步骤1: 发送请求获取下载链接
        console.log("Requesting download URL...");
        const response = await fetch(`${this.baseUrl}/api/v1/Apps/148/BadData?id=148&startDate=2024-01-01&endDate=2024-02-01`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + this.token,
            'Accept': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Network response was not ok.');
        const data = await response.json();
        console.log("Received data:", data);

        // 检查data中是否包含成功的消息和下载路径
        if (data.success && data.data) {
          // const downloadUrl = '/api' + data.data; // 构造完整的下载URL

          // 确保使用从API返回的完整文件路径构造完整的下载URL
          const downloadUrl = `${this.baseUrl}/api/v1/File/Down?filename=${encodeURIComponent(data.data)}`;

          // const downloadUrl = 'http://i.wenjuanji.com/api/v1/File/Down?filename=%2Fdownload%2Ffiles%2F525%2F20240222%2F20240222232432751_148.xls'; // 构造完整的下载URL

          console.log("Download URL:", downloadUrl);

          // 步骤3: 请求下载文件
          console.log("Requesting file download...");
          const fileResponse = await fetch(downloadUrl, {
            method: 'GET',
            headers: {
              'Authorization': 'Bearer ' + this.token,
            }
          });
          if (!fileResponse.ok) throw new Error('File download response was not ok.');
          const blob = await fileResponse.blob();

          // 读取blob并解析
          const reader = new FileReader();
          reader.onload = (e) => {
            const binary = e.target.result;
            const workbook = XLSX.read(binary, { type: 'binary' });

            // 假设我们只关心第一个工作表
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // 将工作表转换为JSON
            const json = XLSX.utils.sheet_to_json(worksheet);
            this.headers = Object.keys(json[0]);
            this.rows = json; // 直接赋值给rows
            console.log(json);
          };
          reader.readAsBinaryString(blob);

          // 步骤4: 创建下载链接并触发下载
          const downloadLink = document.createElement('a');
          downloadLink.href = URL.createObjectURL(blob);
          const filename = downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1); // 从URL提取文件名
          downloadLink.setAttribute('download', filename);
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          console.log("Download triggered successfully.");
        } else {
          console.error("Download link generation failed:", data.msg);
        }
      } catch (error) {
        console.error('Error downloading file:', error);
      }
    }
  }
};
</script>

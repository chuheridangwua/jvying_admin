<template>
  <el-form :model="projectForm" :rules="rules" ref="projectForm" label-width="80px" style="margin: 30px;">
    <el-form-item label="项目标题" prop="title">
      <el-input v-model="projectForm.title"></el-input>
    </el-form-item>
    <el-form-item label="项目图片">
      <el-upload action="#" list-type="picture-card" :auto-upload="false" :file-list="fileList" :on-change="handleChange"
        :on-preview="handlePictureCardPreview" :on-remove="handleRemove">
        <i slot="default" class="el-icon-plus"></i>
        <div slot="file" slot-scope="{file}">
          <img class="el-upload-list__item-thumbnail" :src="file.url" alt="">
          <span class="el-upload-list__item-actions">
            <span class="el-upload-list__item-preview" @click="handlePictureCardPreview(file)">
              <i class="el-icon-zoom-in"></i>
            </span>
            <span v-if="!disabled" class="el-upload-list__item-delete" @click="handleRemove(file)">
              <i class="el-icon-delete"></i>
            </span>
          </span>
        </div>
      </el-upload>
    </el-form-item>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
    <el-form-item label="项目详情" prop="detail">
      <MarkdownPro v-model="projectForm.detail" />
    </el-form-item>
    <el-form-item label="开始时间" prop="startTime">
      <el-date-picker v-model="projectForm.startTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
    </el-form-item>
    <el-form-item label="结束时间" prop="endTime">
      <el-date-picker v-model="projectForm.endTime" type="datetime" placeholder="选择日期时间"></el-date-picker>
    </el-form-item>
    <el-form-item label="项目价格" prop="price">
      <el-input v-model="projectForm.price" type="number"></el-input>
    </el-form-item>
    <el-form-item label="需求人数" prop="peopleNeeded">
      <el-input v-model="projectForm.peopleNeeded" type="number"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :loading="submitting" @click="submitForm">创建项目</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { MarkdownPro } from 'vue-meditor'
import app from '@/api/appwx';
import db from '@/api/database';

export default {
  components: {
    MarkdownPro
  },
  data() {
    const validateTitle = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入项目标题'))
      } else {
        callback()
      }
    }
    const validateDetail = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入项目详情'));
      } else {
        callback();
      }
    };
    const validateStartTime = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请选择开始时间'));
      } else {
        callback();
      }
    };
    const validateEndTime = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请选择结束时间'));
      } else {
        callback();
      }
    };
    const validatePrice = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入项目价格'));
      } else if (isNaN(value)) {
        callback(new Error('项目价格必须为数字值'));
      } else {
        callback();
      }
    };
    const validatePeopleNeeded = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入需求人数'));
      } else if (isNaN(value)) {
        callback(new Error('需求人数必须为数字值'));
      } else {
        callback();
      }
    };
    return {
      projectForm: {
        title: '',
        detail: '',
        startTime: '',
        endTime: '',
        price: '',
        peopleNeeded: ''
      },
      submitting: false, // 追踪提交状态
      rules: {
        title: [{ required: true, trigger: 'blur', validator: validateTitle }],
        detail: [{ required: true, trigger: 'blur', validator: validateDetail }],
        startTime: [{ required: true, trigger: 'change', validator: validateStartTime }],
        endTime: [{ required: true, trigger: 'change', validator: validateEndTime }],
        price: [{ required: true, trigger: 'blur', validator: validatePrice }],
        peopleNeeded: [{ required: true, trigger: 'blur', validator: validatePeopleNeeded }],
      },
      fileList: [],
      dialogImageUrl: '',
      dialogVisible: false,
      disabled: false
    };
  },
  methods: {
    handleRemove(file) {
      // 查找要删除的文件在fileList中的索引
      const index = this.fileList.findIndex(f => f.uid === file.uid);
      if (index !== -1) {
        // 使用splice方法从数组中移除该文件
        this.fileList.splice(index, 1);
      }
    },
    handlePictureCardPreview(file) {
      console.log("file", file);
      console.log("fileList", this.fileList);
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },
    handleChange(file, fileList) {
      // 清除fileList，避免累积已移除的文件
      this.fileList = fileList.slice();

      const newFile = fileList[fileList.length - 1].raw;
      if (newFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
          // 找到新添加的文件，并更新其预览URL
          const index = this.fileList.findIndex(f => f.name === newFile.name && f.size === newFile.size);
          if (index !== -1) {
            this.$set(this.fileList, index, {
              ...this.fileList[index],
              url: e.target.result
            });
          }
        };
        reader.readAsDataURL(newFile);
      }
    },
    async() {
      this.$refs.projectForm.validate(async (valid) => {
        if (valid) {
          console.log("表单验证通过，开始上传数据");
          try {
            const imageFileIDs = await this.uploadImageToCloud(); // 先上传图片
            console.log("图片上传成功，File IDs:", imageFileIDs);
            // 这里添加图片文件ID到表单数据中
            const taskData = {
              ...this.projectForm,
              images: imageFileIDs, // 假设数据库中存储图片ID的字段为images
            };
            // 上传其他表单数据
            const res = await db.collection("task").add({
              data: taskData
            });
            console.log("表单数据上传成功，记录ID：", res);
            // 上传成功后的额外操作，比如提示用户
          } catch (error) {
            console.error("上传数据失败", error);
            // 处理上传失败的情况，例如通过UI反馈给用户
          }
        } else {
          console.log('表单验证失败');
        }
      });
    },
    async uploadImageToCloud() {
      console.log("开始上传图片...");
      console.log("this.fileList", this.fileList);
      if (this.fileList.length === 0) {
        console.log("没有图片需要上传");
        return [];
      }
      const uploadPromises = this.fileList.map((file, index) => {
        const cloudPath = `taskImages/${Date.now()}-${index}-${file.name}`;
        const blob = this.dataURLtoBlob(file.url); // 将数据URL转换为Blob
        console.log(`准备上传图片：${file.name} 到 ${cloudPath}`);
        // 输出Blob信息以供检查
        console.log(`Blob对象：`, blob);
        return app.uploadFile({
          cloudPath: cloudPath,
          filePath: blob, // 使用Blob对象进行上传
        }).then(res => {
          console.log(`图片${file.name}上传成功，返回结果：`, res);
          return res;
        }).catch(error => {
          console.error(`图片${file.name}上传失败，错误：`, error);
          throw error; // 继续抛出错误，以便可以在函数外部捕获
        });
      });
      try {
        const results = await Promise.all(uploadPromises);
        console.log("所有图片上传完成, 结果：", results);
        return results.map(res => res.fileID);
      } catch (error) {
        console.error("上传图片过程中出现错误", error);
        throw error; // 抛出错误以便可以进行进一步处理
      }
    },
    dataURLtoBlob(dataurl) { // 将实用函数作为方法集成
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    },
    async submitForm() {
      this.$refs.projectForm.validate(async (valid) => {
        if (valid) {
          this.submitting = true; // 开始提交，显示加载状态
          try {
            const imageFileIDs = await this.uploadImageToCloud(); // 先上传图片
            console.log("图片上传成功，File IDs:", imageFileIDs);
            const taskData = {
              ...this.projectForm,
              images: imageFileIDs,
            };
            await db.collection("task").add({ data: taskData });
            console.log("表单数据上传成功");
            this.$message.success('项目创建成功');
            // 清空表单
            this.projectForm = {
              title: '',
              detail: '',
              startTime: '',
              endTime: '',
              price: '',
              peopleNeeded: ''
            };
            this.fileList = []; // 清空文件列表
            // 跳转到指定页面
            this.$router.push('/example/tree');
          } catch (error) {
            console.error("上传数据失败", error);
            this.$message.error('项目创建失败');
          } finally {
            this.submitting = false; // 结束提交，隐藏加载状态
          }
        } else {
          console.log('表单验证失败');
          this.$message.error('表单验证失败，请检查输入');
        }
      });
    },
  }
};
</script>

<style scoped>
.uploaded-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  margin-right: 10px;
}
</style>

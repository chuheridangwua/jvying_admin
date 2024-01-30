<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on"
      label-position="left">
      <!-- 注册表单 -->

      <div class="title-container">
        <!-- 注册标题 -->
        <h1 class="title">注册</h1>
      </div>

      <el-form-item prop="name">
        <!-- 姓名输入框 -->
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input ref="name" v-model="loginForm.name" placeholder="请输入您的姓名" name="name" type="text" tabindex="1"
          auto-complete="on" />
      </el-form-item>

      <el-form-item prop="unit">
        <!-- 单位选择框 -->
        <span class="svg-container">
          <svg-icon icon-class="unit" />
        </span>
        <el-select style="width: 300px;" filterable ref="unit" v-model="loginForm.unit" placeholder="请选择您的单位" name="unit"
          type="text" tabindex="1" auto-complete="on">
          <el-option v-for="item in unitList" :key="item._id"
            :label="item.data.unitName + (item.data.status ? '' : '（未审核）')" :value="item._id">
          </el-option>
        </el-select>
        <span class="show-pwd" @click="dialogFormVisible = true">
          <!-- 显示/隐藏密码图标 -->
          <el-button slot="unit" style="color: #abc2cf;background-color: #2d3a4b;border: #889aa4;">申请新单位</el-button>
        </span>
      </el-form-item>

      <el-form-item prop="position">
        <!-- 职位选择框 -->
        <span class="svg-container">
          <svg-icon icon-class="unit" />
        </span>
        <el-select style="width: 300px;" filterable ref="position" v-model="loginForm.position" placeholder="请选择您的职位"
          name="unit" type="text" tabindex="1" auto-complete="on">
          <el-option v-for="item in positionList" :key="item.value" :label="item.label" :value="item.value">
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item prop="username">
        <!-- 用户名输入框 -->
        <span class="svg-container">
          <svg-icon icon-class="phone" />
        </span>
        <el-input ref="username" v-model="loginForm.username" placeholder="请输入手机号" name="username" type="text"
          tabindex="1" auto-complete="on" />
      </el-form-item>

      <el-form-item prop="password">
        <!-- 密码输入框 -->
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input :key="passwordType" ref="password" v-model="loginForm.password" :type="passwordType" placeholder="请输入密码"
          name="password" tabindex="2" auto-complete="on" @keyup.enter.native="handleLogin" />
        <span class="show-pwd" @click="showPwd">
          <!-- 显示/隐藏密码图标 -->
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <el-form-item prop="anginPassword">
        <!-- 密码输入框 -->
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input :key="passwordType" ref="anginPassword" v-model="loginForm.anginPassword" :type="passwordType"
          placeholder="请重复密码" name="anginPassword" tabindex="2" auto-complete="on" @keyup.enter.native="handleLogin" />
        <span class="show-pwd" @click="showPwd">
          <!-- 显示/隐藏密码图标 -->
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <!-- 验证码
      <el-form-item prop="code">
        <span class="svg-container">
          <svg-icon icon-class="email" />
        </span>
        <el-input :key="passwordType" ref="code" v-model="loginForm.password" :type="passwordType" placeholder="请输入验证码"
          name="password" tabindex="2" auto-complete="on" />
        <span class="show-pwd" @click="sendCode">
          <el-button v-show="timeTrue == true" slot="append"
            style="color: #abc2cf;background-color: #2d3a4b;border: #889aa4;">点击发送</el-button>
          <el-button v-show="timeTrue == false" slot="append"
            style="color: #abc2cf;background-color: #2d3a4b;border: #889aa4;">{{ time }}秒后重新获取</el-button>
        </span>
      </el-form-item> -->

      <div style="display: flex; flex-direction: column;">
        <div style="margin-bottom: 10px;">
          <el-button :loading="loading" type="primary" style="width: 100%;"
            @click.native.prevent="applySign">提交注册申请</el-button>
        </div>
      </div>

      <div style="display: flex; flex-direction: column;">
        <div style="margin-bottom: 10px;">
          <el-button plain :loading="loading" type="primary" style="width: 100%;"
            @click.native.prevent="handleBack">返回登录</el-button>
        </div>
      </div>

      <div class="tips">
        <span style="margin-right:20px;">请务必确保提交的信息准确无误，如有错误，请联系客服处理</span>
      </div>

    </el-form>

    <el-dialog custom-class="dialog" title="单位注册" style="width:auto" :visible.sync="dialogFormVisible" center>
      <div class="login-container">
        <el-form style="padding: 15px 0 30px;width:400px" ref="unitform" :model="unitform" :rules="unitRules"
          class="login-form" auto-complete="on" label-position="left">
          <el-form-item prop="unitName">
            <!-- 单位名称输入框 -->
            <span class="svg-container">
              <svg-icon icon-class="unit" />
            </span>
            <el-input ref="unitName" v-model="unitform.unitName" placeholder="请输入单位名称" name="unitName" type="text"
              tabindex="1" auto-complete="on" />
          </el-form-item>

          <el-form-item prop="head">
            <!-- 负责人姓名输入框 -->
            <span class="svg-container">
              <svg-icon icon-class="user" />
            </span>
            <el-input ref="head" v-model="unitform.head" placeholder="请输入负责人姓名" name="head" type="text" tabindex="1"
              auto-complete="on" />
          </el-form-item>

          <el-form-item prop="unitPhone">
            <!-- 负责人电话输入框 -->
            <span class="svg-container">
              <svg-icon icon-class="phone" />
            </span>
            <el-input ref="unitPhone" v-model="unitform.unitPhone" placeholder="请输入负责人电话" name="unitPhone" type="text"
              tabindex="1" auto-complete="on" />
          </el-form-item>

          <div style="display: flex; flex-direction: column;">
            <div style="margin-bottom: 10px;">
              <el-button :loading="loading" type="primary" style="width: 100%;"
                @click.native.prevent="signUnit">提交注册申请</el-button>
            </div>
          </div>

        </el-form>
      </div>
    </el-dialog>

  </div>
</template>

<script>

import { validUsername } from '@/utils/validate'
import db from '@/api/database';

export default {
  name: 'Sign',
  data() {

    const validateUsername = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入您的手机号'))
      }
      else if (value.length !== 11) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])(.{8,})$/;
      if (!value) {
        callback(new Error('请输入您的密码'));
      } else if (!passwordRegex.test(value)) {
        callback(new Error('密码至少包含8位字符，且必须包含数字和字母'));
      } else {
        callback();
      }
    };
    const validateAnginPassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请重复您的密码'))
      }
      else if (value !== this.loginForm.password) {
        callback(new Error('两次输入的密码不一致'))
      }
      else {
        callback()
      }
    }
    const validatePosition = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请选择您的职位'))
      } else {
        callback()
      }
    }
    const validateName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入您的姓名'))
      } else {
        callback()
      }
    }
    const validateUnit = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请选择您所在的单位'))
      } else {
        callback()
      }
    }
    const validateCode = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请获取并输入验证码'))
      } else {
        callback()
      }
    }
    const validateUnitName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入单位名称'))
      } else {
        callback()
      }
    }
    const validateHead = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请获取并输入负责人姓名'))
      } else {
        callback()
      }
    }
    const validateUnitPhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入您的手机号'))
      }
      else if (value.length !== 11) {
        callback(new Error('请输入正确的手机号'))
      } else {
        callback()
      }
    }
    return {
      positionList: [ //职位列表
        { value: '0', label: '单位负责人' },
        { value: '1', label: '员工' },
      ],
      unitList: null,//单位列表
      dialogFormVisible: false, //弹出框
      timeTrue: true, //是否有验证码倒计时
      time: 0, //验证码倒计时
      loginForm: {
        name: '',
        unit: '',
        username: '',
        password: '',
        anginPassword: '',
        position: ''
      },
      unitform: {
        unitName: '',
        head: '',
        unitPhone: '',
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        anginPassword: [{ required: true, trigger: 'blur', validator: validateAnginPassword }],
        name: [{ required: true, trigger: 'blur', validator: validateName }],
        unit: [{ required: true, trigger: 'blur', validator: validateUnit }],
        code: [{ required: true, trigger: 'blur', validator: validateCode }],
        position: [{ required: true, trigger: 'blur', validator: validatePosition }],

      },
      unitRules: {
        unitName: [{ required: true, trigger: 'blur', validator: validateUnitName }],
        head: [{ required: true, trigger: 'blur', validator: validateHead }],
        unitPhone: [{ required: true, trigger: 'blur', validator: validateUnitPhone }],
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  created() {
    this.getUnitList()
  },
  methods: {
    startLoading() {
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)"
      });
      return loading;
    },
    endLoading(loading) {
      loading.close();
    },
    getUnitList() {
      console.log("getUnitList")
      db.collection("UNIT")
        .get()
        .then(res => {
          console.log(res)
          this.unitList = res.data
        })
        .catch(err => {
          console.log(err)
        })
    },
    //发送验证码
    sendCode() {
      this.timeTrue = false;
      this.time = 60;
      var setTimeoutS = setInterval(() => {
        this.time--;
        if (this.time <= 0) {
          clearInterval(setTimeoutS);
          this.timeTrue = true;
        }
      }, 1000);
    },
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    // 提交注册单位
    signUnit() {
      this.$refs.unitform.validate(valid => {
        if (valid) {
          this.startLoading(); // 打开loading
          console.log(this.unitform)
          console.log(this.formatDateTime())
          db.collection("UNIT")
            .add({
              data: {
                unitName: this.unitform.unitName,
                head: this.unitform.head,
                unitPhone: this.unitform.unitPhone,
                createTime: this.formatDateTime(),
                status: false,
                identity: 0
              }
            })
            .then(res => {
              console.log(res)
              this.endLoading(this.startLoading()); // 关闭loading
              this.$message({
                message: '提交成功，请等待审核',
                type: 'success'
              });
              this.dialogFormVisible = false
            })
            .catch(err => {
              console.log(err)
              this.endLoading(this.startLoading()); // 关闭loading
              this.$message.error('提交失败', err);
            })
        } else {
          this.$message.error('请填写完整信息');
          return false
        }
      })
    },
    applySign() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          console.log(this.loginForm, "loginForm")
          db.collection("PERSONNEL")
            .add({
              data: {
                name: this.loginForm.name,
                unit: this.loginForm.unit,
                phone: this.loginForm.username,
                password: this.loginForm.password,
                createTime: this.formatDateTime(),
                status: false,
                position: this.loginForm.position,
                identity: 1
              }
            })
            .then(res => {
              console.log(res)
              this.loading = false
              this.$message({
                message: '提交成功，请等待审核',
                type: 'success'
              });
              this.$router.push('/login');
            })
            .catch(err => {
              this.loading = false
              console.log(err)
              this.$message.error('提交失败', err);
            })
        } else {
          this.$message.error('请填写完整信息')
          return false
        }
      })
    },
    // 返回登录
    handleBack() {
      console.log('handleSign')
      // 清除重定向
      this.redirect = undefined;
      this.$router.push('/login');
    },

    formatDateTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }

  }
}
</script>

<style lang="scss">
.el-dialog {
  padding-top: 20px;
  background-color: #2d3a4b;
  color: white;
}

.el-dialog__title {
  font-size: 34px;
  color: white;
  font-weight: bold;
}

/* 全局样式 */

$bg: #283443;
$light_gray: #fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
/* 组件样式 */

$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background-color: $bg;
  overflow: hidden;

  .login-form {
    position: relative;
    width: 500px;
    max-width: 100%;
    padding: 70px 35px 60px;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 12px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;
    width: 100%;
    /* 设置容器宽度为100% */
  }

  .title {
    font-size: 27px;
    /* 增加字体大小 */
    white-space: nowrap;
    /* 防止换行 */
    color: $light_gray;
    margin: 0 auto 40px auto;
    text-align: center;
    font-weight: bold;
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>

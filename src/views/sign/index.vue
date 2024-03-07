<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on"
      label-position="left">
      <!-- 注册表单 -->
      <div class="title-container">
        <!-- 注册标题 -->
        <h1 class="title">{{ issign ? "注册" : "更新信息" }}</h1>
      </div>
      <el-form-item prop="name">
        <!-- 姓名输入框 -->
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input ref="name" v-model="loginForm.name" placeholder="请输入您的支付宝姓名，用于打款" name="name" type="text" tabindex="1"
          auto-complete="on" />
      </el-form-item>
      <el-form-item prop="username">
        <!-- 用户名 电话 输入框 -->
        <span class="svg-container">
          <svg-icon icon-class="phone" />
        </span>
        <el-input ref="username" v-model="loginForm.username" placeholder="请输入您的支付宝手机号，用于打款" name="username" type="text"
          tabindex="1" auto-complete="on" />
      </el-form-item>
      <el-form-item prop="wenjvan">
        <!-- 问卷 电话 输入框 -->
        <span class="svg-container">
          <svg-icon icon-class="phone" />
        </span>
        <el-input ref="wenjvan" v-model="loginForm.wenjvan" placeholder="请输入您填写问卷时使用的手机号，请使用固定手机号回答问卷" name="wenjvan"
          type="text" tabindex="1" auto-complete="on" />
      </el-form-item>
      <el-form-item prop="password">
        <!-- 密码输入框 -->
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input :key="passwordType" ref="password" v-model="loginForm.password" :type="passwordType"
          placeholder="请输入密码" name="password" tabindex="2" auto-complete="on" @keyup.enter.native="handleLogin" />
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
      <div style="display: flex; flex-direction: column;">
        <div style="margin-bottom: 10px;">
          <el-button :loading="loading" type="primary" style="width: 100%;" @click.native.prevent="applySign">{{ issign
      ? "提交注册" : "确认更新" }}</el-button>
        </div>
      </div>
      <div style="display: flex; flex-direction: column;">
        <div style="margin-bottom: 10px;">
          <el-button plain :loading="loading" type="primary" style="width: 100%;" @click.native.prevent="handleBack">{{
      issign ? "返回登录" : "返回个人中心" }}</el-button>
        </div>
      </div>
      <div class="tips">
        <span style="margin-right:20px;">请务必确保提交的信息准确无误，如有错误，请联系客服处理</span>
      </div>
    </el-form>
  </div>
</template>

<script>

import db from '@/api/database';
import { Message } from 'element-ui';


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
    const validateWenjvan = (rule, value, callback) => {
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
    const validateName = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入您的支付宝姓名'))
      } else {
        callback()
      }
    }
    return {
      issign: true,
      loginForm: {
        name: '',
        username: '',
        wenjvan: '',
        password: '',
        anginPassword: '',
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        anginPassword: [{ required: true, trigger: 'blur', validator: validateAnginPassword }],
        name: [{ required: true, trigger: 'blur', validator: validateName }],
        wenjvan: [{ required: true, trigger: 'blur', validator: validateWenjvan }],
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
    // 获取路由参数中的用户 ID
    const userId = this.$route.query.userId;
    if (userId) {
      console.log('User ID:', userId);
      this.issign = false;
      this.getUserInfo(userId)
    }
  },
  methods: {
    getUserInfo(userId) {
      // 根据用户ID从数据库获取用户信息
      db.collection("users").doc(userId).get().then((res) => {
        console.log("res", res)
        if (res.data) {
          this.loginForm.name = res.data[0].data.payname;
          this.loginForm.username = res.data[0].data.payphone;
          this.loginForm.wenjvan = res.data[0].data.wenjvan;
          this.loginForm.password = res.data[0].data.password;
          this.loginForm.anginPassword = res.data[0].data.password;
          console.log("this.userInfo", this.userInfo)
          // 显示登录成功消息提示
          Message.success('获取用户信息成功');
        } else {
          Message.error('获取用户信息失败');
        }
      }).catch((err) => {
        console.error("获取用户信息失败：", err);
        Message.error('登录时发生错误');
      });
    },
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
    applySign() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;

          if (this.issign) {
            // 查询数据库是否存在相同手机号的用户
            db.collection("users")
              .where({
                "data.phone": this.loginForm.username
              })
              .get()
              .then(res => {
                if (res.data.length > 0) {
                  // 已经注册过的情况
                  this.loading = false;
                  this.$message.error('该手机号已经注册过，请使用其他手机号注册');
                } else {
                  // 未注册过的情况，进行注册
                  db.collection("users")
                    .add({
                      data: {
                        payname: this.loginForm.name,
                        payphone: this.loginForm.username,
                        password: this.loginForm.password,
                        wenjvan: this.loginForm.wenjvan,
                        down: 0,
                        issued: 0,
                        unissued: 0,
                        createTime: this.formatDateTime(),
                      }
                    })
                    .then(res => {
                      this.loading = false;
                      this.$message({
                        message: '注册成功',
                        type: 'success'
                      });
                      this.$router.push('/login');
                    })
                    .catch(err => {
                      this.loading = false;
                      console.error(err);
                      this.$message.error('注册失败，请稍后重试');
                    });
                }
              })
              .catch(err => {
                this.loading = false;
                console.error(err);
                this.$message.error('注册失败，请稍后重试');
              });
          } else {
            db.collection("users")
              .where({
                "data.phone": this.loginForm.username
              })
              .update({
                data: {
                  payname: this.loginForm.name,
                  phone: this.loginForm.username,
                  payphone: this.loginForm.username,
                  password: this.loginForm.password,
                  wenjvan: this.loginForm.wenjvan,
                  updateTime: this.formatDateTime(),
                }
              })
              .then(res => {
                console.log(res)
                this.loading = false;
                this.$message({
                  message: '更新成功',
                  type: 'success'
                });
                this.$router.push('/login');
              })
              .catch(err => {
                this.loading = false;
                console.error(err);
                this.$message.error('更新失败，请稍后重试');
              });
          }
        } else {
          this.$message.error('请填写完整信息');
          return false;
        }
      });
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

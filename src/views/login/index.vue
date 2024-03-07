<template>
  <div class="login-container">

    <!-- 如果用户已登录，显示个人信息 -->
    <div v-if="loggedIn">
      <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on"
        label-position="left">
        <!-- 登录表单 -->
        <div class="title-container">
          <!-- 登录标题 -->
          <h1 class="title">开言调查个人中心</h1>
        </div>

        <el-row :gutter="10">
          <el-col :span="11">
            <!-- 问卷手机号展示卡片 -->
            <!-- <el-card shadow="hover" style="width: 100%; margin-bottom: 20px;">
              <div style="width: 100%; ">
                <div style="display: flex;">
                  <h3 style="margin-top: 5px;margin-right:  10px;margin-bottom: 0px;">欢迎你</h3>
                </div>
                <h5 style="margin-top: 15px;margin-right:  10px;margin-bottom: 0px;">{{ userInfo.payname }}</h5>
              </div>
            </el-card> -->
            <!-- 问卷手机号展示卡片 -->
            <el-card shadow="hover" style="width: 100%; margin-bottom: 20px;">
              <div style="width: 100%; ">
                <div style="display: flex;">
                  <h3 style="margin-top: 5px;margin-right:  10px;margin-bottom: 0px;">问卷手机号</h3>
                </div>
                <h5 style="margin-top: 15px;margin-right:  10px;margin-bottom: 0px;">{{ userInfo.wenjvan }}</h5>
              </div>
            </el-card>
            <!-- 提现信息展示卡片 -->
            <el-card shadow="hover" style="width: 100%; margin-bottom: 20px;">
              <div style="width: 100%; ">
                <div style="display: flex;">
                  <h3 style="margin-top: 5px;margin-right:  10px;margin-bottom: 0px;">提现信息</h3>
                </div>
                <h5 style="margin-top: 15px;margin-right:  10px;margin-bottom: 0px;">姓名：{{ userInfo.payname }}</h5>
                <h5 style="margin-top: 15px;margin-right:  10px;margin-bottom: 0px;">手机号：{{ userInfo.phone }}</h5>
              </div>
            </el-card>
          </el-col>
          <el-col :span="13">
            <el-card shadow="hover" style="width: 100%; margin-bottom: 20px;">
              <div style="width: 100%; ">
                <div style="display: flex;">
                  <h3 style="margin-top: 5px;margin-right:  10px;margin-bottom: 0px;">薪资信息</h3>
                </div>
                <h5 style="margin-top: 15px;margin-right:  10px;margin-bottom: 0px;">已完成问卷：{{ userInfo.down }}份</h5>
                <h5 style="margin-top: 15px;margin-right:  10px;margin-bottom: 0px;">待结算：{{ userInfo.issued }}元</h5>
                <h5 style="margin-top: 15px;margin-right:  10px;margin-bottom: 0px;">已结算：{{ userInfo.unissued }}元</h5>
              </div>
            </el-card>
            <el-card shadow="hover" style="width: 100%; margin-bottom: 20px;">
              <div style="width: 100%; ">
                <div style="display: flex;">
                  <h3 style="margin-top: 5px;margin-right:  10px;margin-bottom: 0px;">客服信息</h3>
                </div>
                <h5 style="margin-top: 15px;margin-right:  10px;margin-bottom: 0px;">QQ：xxxxxxxxxx</h5>
                <h5 style="margin-top: 15px;margin-right:  10px;margin-bottom: 0px;">微信：xxxxxxxxxx</h5>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <div style="display: flex; flex-direction: column;">
          <div style="margin-top: 10px;">
            <el-button :loading="false" type="warning" style="width: 100%;" @click="gosign">修改</el-button>
          </div>
          <div style="margin-bottom: 20px;margin-top: 10px;">
            <el-button plain :loading="false" type="primary" style="width: 100%;" @click="logout">退出</el-button>
          </div>
        </div>
        <div class="tips">
          <!-- 用户名和密码提示 -->
          <!-- <span style="margin-right:20px;">请务必确保提交的信息准确无误，如有错误，请联系客服处理</span> -->
        </div>
      </el-form>



    </div>
    <!-- 如果用户未登录，显示登录表单 -->
    <div v-else>
      <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on"
        label-position="left">
        <!-- 登录表单 -->
        <div class="title-container">
          <!-- 登录标题 -->
          <h1 class="title">开言调查个人中心</h1>
        </div>
        <el-form-item prop="username">
          <!-- 用户名输入框 -->
          <span class="svg-container">
            <svg-icon icon-class="user" />
          </span>
          <el-input ref="username" v-model="loginForm.username" placeholder="请输入手机号" name="username" type="text"
            tabindex="1" auto-complete="on" />
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
        <el-checkbox style="margin-left: 10px;margin-bottom: 20px; color: #fff;"
          v-model="rememberPassword">记住密码</el-checkbox>
        <div style="display: flex; flex-direction: column;">
          <div style="margin-bottom: 10px;">
            <el-button :loading="loading" type="primary" style="width: 100%;"
              @click.native.prevent="handleLogin">登录</el-button>
          </div>
          <div style="margin-bottom: 20px;">
            <el-button plain :loading="false" type="primary" style="width: 100%;"
              @click.native.prevent="handleSign">注册</el-button>
          </div>
        </div>
        <div class="tips">
          <!-- 用户名和密码提示 -->
          <span style="margin-right:20px;">请务必确保提交的信息准确无误，如有错误，请联系客服处理</span>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import db from '@/api/database';
import app from '@/api/appwx';
import { Message } from 'element-ui';

export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入手机号'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入密码'))
      } else {
        callback()
      }
    }
    return {
      dialogFormVisible: false,

      loggedIn: false,
      userInfo: {}, // 用户信息
      withdrawalInfo: {}, // 提现信息
      rememberPassword: false, // 是否记住密码
      loginForm: {
        username: null,
        password: null
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      loading: false,
      passwordType: 'password',
      redirect: undefined
    }
  },
  created() {
    const userSession = JSON.parse(localStorage.getItem('userSession'));
    const loginForm = JSON.parse(localStorage.getItem('loginForm'));
    console.log('userSession', userSession)
    console.log('loginForm', loginForm)
    if (userSession && userSession.loggedIn) {
      this.loggedIn = true;
      // 从数据库获取用户信息
      this.getUserInfo(userSession.userId); // 修改这里，传入用户ID
    }
    if (loginForm.username && loginForm.password) {
      this.loginForm.username = loginForm.username;
      this.loginForm.password = loginForm.password;
      this.rememberPassword = true;
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
  methods: {
    editWithdrawalInfo() {
      console.log(this.editMode)
      this.editMode = true;
    },
    confirmEdit() {
      // 根据编辑模式更新对应字段
      this.userInfo.name = this.editName;
      this.userInfo.phone = this.editPhone;
      this.editMode = false;
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
    getUserInfo(userId) {
      // 根据用户ID从数据库获取用户信息
      db.collection("users").doc(userId).get().then((res) => {
        console.log("res", res)
        if (res.data) {
          this.userInfo = res.data[0].data;
          console.log("this.userInfo", this.userInfo)
          // 显示登录成功消息提示
          Message.success('登录成功');
        } else {
          Message.error('获取用户信息失败');
        }
      }).catch((err) => {
        console.error("获取用户信息失败：", err);
        Message.error('登录时发生错误');
      });
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true;
          // 登录验证逻辑
          db.collection("users")
            .aggregate()
            .match({
              "data.phone": this.loginForm.username,
              "data.password": this.loginForm.password
            })
            .end()
            .then((res) => {
              console.log("res", res)
              if (res.data.length > 0) {
                this.loggedIn = true
                // 登录成功，获取用户信息并存储到缓存中
                const userId = res.data[0]._id; // 修改这里，获取用户ID
                this.getUserInfo(userId);
                const userSession = {
                  loggedIn: true,
                  userId: userId,
                  rememberPassword: this.rememberPassword
                };
                let loginForm = null
                if (this.rememberPassword) {
                  // 如果选择记住密码，将账户密码也存入缓存
                  userSession.rememberPassword = true;
                  loginForm = {
                    username: this.loginForm.username,
                    password: this.loginForm.password
                  };
                }
                // 将登录状态和用户ID存储到本地缓存中
                localStorage.setItem('userSession', JSON.stringify(userSession));
                localStorage.setItem('loginForm', JSON.stringify(loginForm));
              } else {
                Message.error('用户名或密码错误');
              }
              this.loading = false;
            })
            .catch((err) => {
              console.error("查询失败：", err);
              Message.error('登录时发生错误');
              this.loading = false;
            });
        } else {
          console.log('error submit!!')
          return false;
        }
      });
    },
    logout() {
      // 清除用户会话和登录表单数据
      localStorage.removeItem('userSession');

      // 重置用户信息并将 loggedIn 设置为 false
      this.userInfo = {};
      this.loggedIn = false;

      // 重定向到登录页面
      this.$router.push('/login');
    },
    handleSign() {
      console.log('handleSign')
      // 清除重定向
      this.redirect = undefined;
      this.$router.push('/sign');
    },
    gosign() {
      let userId = JSON.parse(localStorage.getItem('userSession')).userId
      this.$router.push({
        path: '/sign',
        query: { userId: userId } // 将用户 ID 作为路由参数传递
      });
    }
  }
}
</script>

<style lang="scss">
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
    padding: 110px 35px 0;
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

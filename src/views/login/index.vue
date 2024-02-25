<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on"
      label-position="left">
      <!-- 登录表单 -->

      <div class="title-container">
        <!-- 登录标题 -->
        <h1 class="title">开言调查后台管理系统</h1>
      </div>

      <el-form-item prop="username">
        <!-- 用户名输入框 -->
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input ref="username" v-model="loginForm.username" placeholder="请输入手机号" name="username" type="text"
          tabindex="1" auto-complete="on" @keyup.enter.native="handleLogin" />
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

      <el-form-item prop="captcha" class="captcha-container">
        <!-- 验证码输入框 -->
        <span class="svg-container">
          <svg-icon icon-class="captcha" />
        </span>
        <el-input ref="captcha" v-model="loginForm.captcha" placeholder="请输入验证码" name="captcha" tabindex="3"
          auto-complete="on" @keyup.enter.native="handleLogin" class="captcha-input" />
        <img :src="captchaImageSrc" alt="验证码" @click="getCaptcha" class="captcha-image">
      </el-form-item>

      <div style="display: flex; flex-direction: column;">
        <div style="margin-bottom: 10px;">
          <el-button :loading="loading" type="primary" style="width: 100%;"
            @click.native.prevent="handleLogin">登录</el-button>
        </div>
      </div>

      <div class="tips">
        <!-- 提示 -->
        <span style="margin-right:20px;">点击验证码图片可以换一张哦~</span>
      </div>

    </el-form>
  </div>
</template>

<script>
// import { validUsername } from '@/utils/validate'
import db from '@/api/database';
import app from '@/api/appwx';

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
    const validateCaptcha = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入验证码'))
      } else {
        callback()
      }
    }
    return {
      captchaImageSrc: '',
      captchaId: '',
      loginForm: {
        username: null,
        password: null,
        captcha: null
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        captcha: [{ required: true, trigger: 'blur', validator: validateCaptcha }]
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
    this.getCaptcha();
  },
  methods: {
    // 获取验证码
    getCaptcha() {
      app.callFunction({
        name: "getUrl",
        data: {
          url: 'http://i.wenjuanji.com/api/v1/Captcha/Image'
        }
      })
        .then((res) => {
          console.log("获取验证码成功", res)
          const result = JSON.parse(res.result); // Parse the JSON string in the result
          if (result && result.success) {
            // Set the captchaImageSrc to the base64 image source
            this.captchaImageSrc = `data:image/png;base64,${result.data.base64}`;
            this.captchaId = result.data.id;
          }
        })
        .catch(console.error);
    },
    // 是否可见密码
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
    // 使用问卷集进行登录
    async loginWithCloudFunction(captcha) {
      this.loading = true;
      try {
        console.log("captchaId:", this.captchaId);
        console.log("captcha:", captcha);
        const queryParams = new URLSearchParams({
          name: "838583969@qq.com",
          password: "wenjuanji1",
          captchaId: this.captchaId,
          captcha: captcha
        });

        const res = await app.callFunction({
          name: "postUrl",
          data: {
            url: `http://i.wenjuanji.com/api/v1/Login?${queryParams.toString()}`
          }
        });

        console.log("问卷集登录结果:", res);
        const result = JSON.parse(res.result);
        if (result && result.success) {
          this.$message({
            message: '问卷集登录成功',
            type: 'success'
          });
          localStorage.setItem('wenjvanjiToken', result.data.token);
          return result; // Make sure to return the result for further processing
        } else {
          this.$message({
            message: '问卷集登录失败',
            type: 'error'
          });
          this.getCaptcha(); // 刷新验证码
          return null; // Return null or false to indicate failure
        }
      } catch (error) {
        console.error('问卷集登录错误:', error);
        this.$message({
          message: '问卷集登录异常',
          type: 'error'
        });
        this.getCaptcha(); // 刷新验证码
      } finally {
        this.loading = false; // 确保加载状态被终止
      }
    },
    // 数据库登录
    async handleLogin() {
      console.log('login');
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          // 验证本地数据库
          const localLoginResult = await this.localLogin();
          // 验证云函数
          const cloudLoginResult = await this.loginWithCloudFunction(this.loginForm.captcha);

          if (localLoginResult && cloudLoginResult) {
            // 如果本地和云函数登录都成功，跳转到主页
            this.$router.push({ path: this.redirect || '/' });
          } else {
            // 如果任何一个登录失败，显示错误并留在登录页
            this.getCaptcha(); // 刷新验证码
          }
        } else {
          this.$message({
            message: '请完善登录信息',
            type: 'error'
          });
          console.log('error submit!!');
          return false;
        }
      });
    },
    // 本地数据库验证逻辑
    async localLogin() {
      try {
        const res = await db.collection("administrator")
          .aggregate()
          .match({
            phone: this.loginForm.username,
            password: this.loginForm.password
          })
          .end();
        console.log("本地登录", res);
        if (res.data.length > 0) {
          console.log(res.data[0]._id);
          this.storeLoginSession(res.data[0]._id);
          return true; // 本地登录成功
        } else {
          this.$message({
            message: '本地登录失败：用户名或密码错误',
            type: 'error'
          });
          return false; // 本地登录失败
        }
      } catch (err) {
        console.error("本地登录查询失败：", err);
        this.$message({
          message: '本地登录异常：网络错误或数据库问题',
          type: 'error'
        });
        return false; // 本地登录异常
      }
    },
    handleSign() {
      console.log('handleSign')
      // 清除重定向
      this.redirect = undefined;
      this.$router.push('/sign');
    },
    storeLoginSession(token) {
      const now = new Date();
      const item = {
        loggedIn: true,
        token: token, // 假设使用token作为登录凭证
        expiry: now.getTime() + 3600000, // 当前时间 + 1小时的毫秒数
      };
      localStorage.setItem('userSession', JSON.stringify(item));
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
    padding: 160px 35px 0;
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

  .captcha-container {
    display: flex;
    align-items: center;

    .captcha-input {
      // cursor: pointer;
      height: 30px; // 你可以根据需要调整大小
      width: 290px;
    }

    .captcha-image {
      // cursor: pointer;
      margin-left: 10px;
      transform: translateY(10px);
      height: 35px; // 你可以根据需要调整大小
    }
  }
}
</style>

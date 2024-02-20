<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on"
      label-position="left">
      <!-- 登录表单 -->

      <div class="title-container">
        <!-- 登录标题 -->
        <h1 class="title">长清区工业项目征供地推进后台系统</h1>
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
        <el-input :key="passwordType" ref="password" v-model="loginForm.password" :type="passwordType" placeholder="请输入密码"
          name="password" tabindex="2" auto-complete="on" @keyup.enter.native="handleLogin" />
        <span class="show-pwd" @click="showPwd">
          <!-- 显示/隐藏密码图标 -->
          <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
        </span>
      </el-form-item>

      <div style="display: flex; flex-direction: column;">
        <div style="margin-bottom: 10px;">
          <el-button :loading="loading" type="primary" style="width: 100%;"
            @click.native.prevent="handleLogin">登录</el-button>

          <el-button :loading="loading" type="primary" style="width: 100%;" @click.native.prevent="ceshi">测试</el-button>
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
</template>

<script>
import { validUsername } from '@/utils/validate'
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
    return {
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
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
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
    ceshi() {
      app
        .callFunction({
          // 云函数名称
          name: "test",
          // 传给云函数的参数
          data: {
            userid: "user1234",
            projectid: 1,
            status: "c",
            price: 111
          }
        })
        .then((res) => {
          console.log(res);
        })
        .catch(console.error);

      // db.collection("PERSONNEL")
      //   .then((res) => {
      //     console.log(res);

      //   })
      //   .catch((err) => {
      //     console.error("查询失败：", err);
      //   });
    },
    handleLogin() {
      console.log('login')
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          // this.$store.dispatch('user/login', this.loginForm).then(() => {
          console.log(this.loginForm)

          db.collection("PERSONNEL")
            .aggregate()
            // 匹配符合条件的文档
            .match({
              "data.phone": this.loginForm.username,
              "data.password": this.loginForm.password
            })
            // 执行查询操作
            .end()
            .then((res) => {
              // 查询成功，res 包含符合条件的文档
              console.log(res);
              console.log(this.$root.userStatus, "this.$root.ORDERID ");
              // this.global.userStatus = true
              this.$root.userStatus = "xxxxx123"
              console.log(this.$root.userStatus, "this.$root.ORDERID ");

              if (res.data.length > 0) {
                // 登录成功，跳转到目标页面
                this.$router.push({ path: this.redirect || '/' });
              } else {
                // 登录失败，处理失败逻辑
                console.log("登录失败：用户名或密码错误");
              }
              this.loading = false; // 停止加载状态
            })
            .catch((err) => {
              // 查询失败，处理错误
              console.error("查询失败：", err);
              this.loading = false; // 停止加载状态
            });

        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    handleSign() {
      console.log('handleSign')
      // 清除重定向
      this.redirect = undefined;
      this.$router.push('/sign');
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
}
</style>

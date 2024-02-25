// login.js

import cloudbase from '@cloudbase/js-sdk';

const app = cloudbase.init({
  env: 'part-time-0gls03fkb9ad827d' // 填入您的环境 ID
});

const auth = app.auth();

async function login() {
  try {
    // 调用匿名登录接口
    await auth.anonymousAuthProvider().signIn();
    // 匿名登录成功后，登录状态isAnonymous字段值为true
    const loginState = await auth.getLoginState();
    console.log("登录状态",loginState.isAnonymousAuth); // true
    // 这里可以做登录成功后的操作，例如获取用户信息等
  } catch (error) {
    console.error('登录失败', error);
    // 这里可以处理登录失败的逻辑，例如提示用户重新登录等
  }
}

export default login;

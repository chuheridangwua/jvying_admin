// database.js

import cloudbase from '@cloudbase/js-sdk';
import login from '@/api/wxlogin';

const app = cloudbase.init({
    env: 'jvyingzhongbao-1g4qvecl6e75139d' // 填入您的环境 ID
});

login();

const db = app.database();

export default db;

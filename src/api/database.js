// database.js

import cloudbase from '@cloudbase/js-sdk';
import login from '@/api/wxlogin';

const app = cloudbase.init({
    env: 'disk-9gos565188054239' // 填入您的环境 ID
});

login();

const db = app.database();

export default db;

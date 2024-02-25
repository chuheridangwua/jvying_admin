// database.js

import cloudbase from '@cloudbase/js-sdk';
import login from '@/api/wxlogin';

const app = cloudbase.init({
    env: 'part-time-0gls03fkb9ad827d' // 填入您的环境 ID
});

login();

const db = app.database();

export default db;

// database.js

import cloudbase from '@cloudbase/js-sdk';
import login from '@/api/wxlogin';

login();

const app = cloudbase.init({
    env: "jvyingzhongbao-1g4qvecl6e75139d"
});

export default app;

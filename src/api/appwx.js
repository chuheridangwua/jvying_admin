// database.js

import cloudbase from '@cloudbase/js-sdk';
import login from '@/api/wxlogin';

login();

const app = cloudbase.init({
    env: "part-time-0gls03fkb9ad827d"
});

export default app;

// import router from './router'
// import store from './store'
// import { Message } from 'element-ui'
// import NProgress from 'nprogress' // progress bar
// import 'nprogress/nprogress.css' // progress bar style
// import { getToken } from '@/utils/auth' // get token from cookie
// import getPageTitle from '@/utils/get-page-title'

// NProgress.configure({ showSpinner: false }) // NProgress Configuration

// const whiteList = ['/login', '/sign'] // no redirect whitelist

// router.beforeEach(async (to, from, next) => {
//   // 开始进度条
//   NProgress.start()

//   // 设置页面标题
//   document.title = getPageTitle(to.meta.title)

//   // 判断用户是否已登录
//   // const hasToken = getToken()
//   // const hasToken = "get"
//   const hasToken = null

//   console.log(hasToken,"hasToken")

//   if (hasToken) {
//     if (to.path === '/login') {
//       // 如果已登录，重定向到首页
//       next({ path: '/' })
//       NProgress.done()
//     } else {
//       const hasGetUserInfo = store.getters.name
//       if (hasGetUserInfo) {
//         next()
//       } else {
//         try {
//           // 获取用户信息
//           // await store.dispatch('user/getInfo')

//           next()
//         } catch (error) {
//           // 删除token并重定向到登录页面重新登录
//           // await store.dispatch('user/resetToken')
//           Message.error(error || '出错')
//           next(`/login?redirect=${to.path}`)
//           NProgress.done()
//         }
//       }
//     }
//   } else {
//     /* 无token */

//     if (whiteList.indexOf(to.path) !== -1) {
//       // 在免费登录白名单内，直接进入
//       next()
//     } else {
//       // 其他无权限访问的页面重定向到登录页面
//       next(`/login?redirect=${to.path}`)
//       NProgress.done()
//     }
//   }
// })

// router.afterEach(() => {
//   // 完成进度条
//   NProgress.done()
// })
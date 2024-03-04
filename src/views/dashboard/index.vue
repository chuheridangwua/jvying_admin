<template>
  <div class="dashboard-container">
    <h1 class="dashboard-text">欢迎来到聚英众包后台管理系统</h1>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'name'
    ])
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 50px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>

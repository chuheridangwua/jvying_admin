<template>
    <div style="margin: 30px 50px;">
        <el-date-picker style="margin-bottom: 20px;" v-model="selectedDate" type="date" placeholder="选择日期" format="yyyy 年 MM 月 dd 日"
            value-format="yyyy-MM-dd">
        </el-date-picker>
        <el-button type="primary" @click="fetchDataByDate" style="margin-left: 10px;">查找</el-button>
        <el-table :data="completedProjects" style="width: 100%" border highlight-current-row
            :default-sort="{ prop: '完成时间', order: 'descending' }">
            <el-table-column type="index" label="序号" width="50"></el-table-column>
            <el-table-column prop="调查ID" label="调查ID" width="100"></el-table-column>
            <el-table-column prop="调查名称" label="调查名称"></el-table-column>
            <el-table-column prop="价格" label="价格" width="80" sortable>
                <template slot-scope="scope">
                    <el-tag type="success">{{ scope.row.价格 }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="会员ID" label="会员ID" width="300"></el-table-column>
            <el-table-column prop="手机号码" label="手机号码" width="120"></el-table-column>
            <el-table-column prop="状态" label="状态" width="100" sortable>
                <template slot-scope="scope">
                    <el-tag :type="getStatusTagType(scope.row.状态)">{{ scope.row.状态 }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="结算" label="结算" width="90" sortable>
                <template slot-scope="scope">
                    <el-tag v-if="scope.row.结算" type="success">已结算</el-tag>
                    <el-tag v-else type="danger">未结算</el-tag>
                </template>
            </el-table-column>
            <el-table-column prop="完成时间" label="完成时间" width="170" sortable></el-table-column>
        </el-table>

    </div>
</template>


<script>
import db from '@/api/database';

export default {
    name: 'TreeIndex',
    data() {
        return {
            completedProjects: [],
            selectedDate: this.formatDate(new Date()) // 使用格式化方法初始化为当前日期
        };
    },
    mounted() {
        this.fetchDataByDate(); // 初次加载时获取今天的数据
    },
    methods: {
        getStatusTagType(status) {
            switch (status) {
                case '成功完成':
                    return 'success';
                case '配额满':
                    return 'info';
                case '被甄别':
                    return 'danger';
                default:
                    return 'warning';
            }
        },
        fetchDataByDate() {
            let loadingInstance = this.$loading({ // 开始加载数据时显示加载动画
                lock: true,
                text: '正在加载...',
                spinner: 'el-icon-loading',
                background: 'rgba(255, 255, 255, 0.7)'
            });
            console.log("selectedDate", this.selectedDate);
            const query = db.collection("settlementData");
            query.where({
                "data.date": this.selectedDate
            }).get().then(res => {
                console.log(res, "res");
                this.completedProjects = res.data.flatMap(item => item.data.rows.map(project => ({
                    调查ID: project['调查ID'], // 映射字段
                    调查名称: project['调查名称'], // 映射字段
                    价格: project['price'], // 映射字段
                    会员ID: project['会员ID'], // 映射字段
                    手机号码: project['手机号码'], // 映射字段
                    状态: project['状态'], // 映射字段
                    结算: project['settlementStatus'], // 映射字段
                    完成时间: project['完成时间'] // 映射字段
                })));
                console.log(this.completedProjects, "completedProjects");
            }).catch(err => {
                console.error(err);
            }).finally(() => {
                loadingInstance.close(); // 数据处理完成后关闭加载动画
            });
        },
        formatDate(date) {
            let month = '' + (date.getMonth() + 1),
                day = '' + date.getDate(),
                year = date.getFullYear();

            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;

            return [year, month, day].join('-');
        }
    }

};
</script>

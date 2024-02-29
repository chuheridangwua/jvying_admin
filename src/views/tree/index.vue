<template>
    <div v-loading="loading">
        <!-- 搜索框 -->
        <el-input style="margin:20px;width: 20%;" v-model="searchQuery" placeholder="请输入项目标题" class="search-box"
            @input="filterProjects">
        </el-input>
        <!-- 项目信息表格 -->
        <el-table :data="filteredProjects" style="width: 95%;margin:0 20px;" row-height="100">
            <el-table-column type="index" label="#" width="50"></el-table-column>
            <el-table-column prop="data.title" label="项目标题" width="180"></el-table-column>
            <el-table-column label="项目图片" width="180">
                <template slot-scope="scope">
                    <div class="image-container">
                        <img v-if="scope.row.data.imagesUrls && scope.row.data.imagesUrls.length > 0"
                            :src="scope.row.data.imagesUrls[0]" alt="项目图片">
                    </div>
                </template>
            </el-table-column>
            <el-table-column label="项目详情">
                <template slot-scope="scope">
                    {{ scope.row.data.detail.substring(0, 20) + (scope.row.data.detail.length > 20 ? '...' : '') }}
                </template>
            </el-table-column>
            <el-table-column label="开始时间" width="180">
                <template slot-scope="scope">
                    {{ formatDate(new Date(scope.row.data.startTime)) }}
                </template>
            </el-table-column>
            <el-table-column label="结束时间" width="180">
                <template slot-scope="scope">
                    {{ formatDate(new Date(scope.row.data.endTime)) }}
                </template>
            </el-table-column>
            <el-table-column prop="data.price" label="任务价格" width="100"></el-table-column>
            <el-table-column prop="data.peopleNeeded" label="需求人数" width="100"></el-table-column>
        </el-table>
    </div>
</template>

<script>
import db from '@/api/database';
import app from '@/api/appwx';

export default {
    data() {
        return {
            searchQuery: '',
            projects: [],
            filteredProjects: [],
            loading: true, // 控制加载状态
        };
    },
    mounted() {
        this.fetchProjects();
    },
    methods: {
        async fetchProjects() {
            try {
                const res = await db.collection("task").get();
                console.log("查询成功：", res);
                const fileIDs = res.data.reduce((acc, project) => {
                    if (project.data.images) {
                        acc.push(...project.data.images);
                    }
                    return acc;
                }, []);
                const downloadRes = await app.getTempFileURL({
                    fileList: fileIDs,
                });
                // 创建一个映射，以便快速查找文件ID对应的临时URL
                const urlMap = downloadRes.fileList.reduce((acc, file) => {
                    acc[file.fileID] = file.tempFileURL;
                    return acc;
                }, {});
                // 将获取到的临时URL添加到项目数据中
                const projectsWithImages = res.data.map(project => {
                    const imagesUrls = (project.data.images || []).map(fileID => urlMap[fileID] || '');
                    return { ...project, data: { ...project.data, imagesUrls } };
                });
                this.projects = projectsWithImages;
                this.filteredProjects = projectsWithImages;
                this.loading = false;
            } catch (err) {
                console.error("查询失败：", err);
                this.$message.error('获取数据失败：网络错误');
                this.loading = false;
            }
        },
        filterProjects() {
            if (this.searchQuery) {
                this.filteredProjects = this.projects.filter(project =>
                    project.data.title.toLowerCase().includes(this.searchQuery.toLowerCase())
                );
            } else {
                this.filteredProjects = this.projects;
            }
        },
        formatDate(date) {
            if (!(date instanceof Date)) {
                console.error("Provided value is not a Date instance:", date);
                return 'Invalid Date';
            }
            return date.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }) + ' ' +
                date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        }
    }
};
</script>

<style scoped>
.search-box {
    margin-bottom: 20px;
}

.image-container img {
    width: 100px;
    height: 100px;
    object-fit: cover;
    /* 保持图片比例 */
}

.el-table .cell {
    line-height: 100px;
    /* 每一行高度固定 */
}
</style>


/**
 * 成绩状态管理
 */
import { GradeApi } from '../api/grade.js';

export const GradeStore = {
    grades: [],
    currentGrade: null,
    statistics: null,
    pagination: {
        page: 1,
        size: 10,
        total: 0,
        total_pages: 1
    },
    keyword: '',
    minScore: null,
    maxScore: null,
    loading: false,
    
    /**
     * 设置成绩列表
     */
    setGrades(grades, pagination) {
        this.grades = grades;
        if (pagination) {
            this.pagination = pagination;
        }
    },
    
    /**
     * 设置当前成绩
     */
    setCurrentGrade(grade) {
        this.currentGrade = grade;
    },
    
    /**
     * 设置统计数据
     */
    setStatistics(statistics) {
        this.statistics = statistics;
    },
    
    /**
     * 设置搜索关键字
     */
    setKeyword(keyword) {
        this.keyword = keyword;
    },
    
    /**
     * 设置分数范围
     */
    setScoreRange(minScore, maxScore) {
        this.minScore = minScore;
        this.maxScore = maxScore;
    },
    
    /**
     * 加载成绩列表
     */
    async loadGrades(page = 1, keyword = null, minScore = null, maxScore = null) {
        this.loading = true;
        try {
            const params = {
                page,
                size: this.pagination.size
            };
            
            if (keyword !== null) {
                this.keyword = keyword;
            }
            if (minScore !== undefined) {
                this.minScore = minScore;
            }
            if (maxScore !== undefined) {
                this.maxScore = maxScore;
            }
            
            if (this.keyword) {
                params.keyword = this.keyword;
            }
            if (this.minScore !== null) {
                params.min_score = this.minScore;
            }
            if (this.maxScore !== null) {
                params.max_score = this.maxScore;
            }
            
            const response = await GradeApi.getGrades(params);
            if (response.success) {
                this.setGrades(response.data, response.pagination);
            }
            return response;
        } finally {
            this.loading = false;
        }
    },
    
    /**
     * 加载统计数据
     */
    async loadStatistics() {
        this.loading = true;
        try {
            const response = await GradeApi.getStatistics();
            if (response.success) {
                this.setStatistics(response.data);
            }
            return response;
        } finally {
            this.loading = false;
        }
    },
    
    /**
     * 获取单个成绩
     */
    async getGrade(id) {
        const response = await GradeApi.getGrade(id);
        if (response.success) {
            this.setCurrentGrade(response.data);
        }
        return response;
    },
    
    /**
     * 创建成绩
     */
    async createGrade(data) {
        const response = await GradeApi.createGrade(data);
        if (response.success) {
            await this.loadGrades(1);
            await this.loadStatistics();
        }
        return response;
    },
    
    /**
     * 更新成绩
     */
    async updateGrade(id, data) {
        const response = await GradeApi.updateGrade(id, data);
        if (response.success) {
            await this.loadGrades(this.pagination.page);
            await this.loadStatistics();
        }
        return response;
    },
    
    /**
     * 删除成绩
     */
    async deleteGrade(id) {
        const response = await GradeApi.deleteGrade(id);
        if (response.success) {
            // 如果当前页没有数据了，回到上一页
            if (this.grades.length === 1 && this.pagination.page > 1) {
                await this.loadGrades(this.pagination.page - 1);
            } else {
                await this.loadGrades(this.pagination.page);
            }
            await this.loadStatistics();
        }
        return response;
    },
    
    /**
     * 清空状态
     */
    clear() {
        this.grades = [];
        this.currentGrade = null;
        this.statistics = null;
        this.pagination = { page: 1, size: 10, total: 0, total_pages: 1 };
        this.keyword = '';
        this.minScore = null;
        this.maxScore = null;
    }
};

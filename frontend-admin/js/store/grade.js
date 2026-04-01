/**
 * 成绩状态管理
 */
import { GradeApi } from '../api/grade.js';

export const GradeStore = {
    grades: [],
    currentGrade: null,
    pagination: {
        page: 1,
        size: 10,
        total: 0,
        total_pages: 1
    },
    keyword: '',
    minScore: null,
    maxScore: null,
    statistics: null,
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
     * 设置搜索关键字和分数筛选
     */
    setFilters(keyword, minScore, maxScore) {
        this.keyword = keyword;
        this.minScore = minScore;
        this.maxScore = maxScore;
    },
    
    /**
     * 设置统计数据
     */
    setStatistics(statistics) {
        this.statistics = statistics;
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
            if (minScore !== undefined && minScore !== null) {
                this.minScore = minScore;
            }
            if (maxScore !== undefined && maxScore !== null) {
                this.maxScore = maxScore;
            }
            
            if (this.keyword) {
                params.keyword = this.keyword;
            }
            if (this.minScore !== null && this.minScore !== '') {
                params.min_score = this.minScore;
            }
            if (this.maxScore !== null && this.maxScore !== '') {
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
        try {
            const response = await GradeApi.getStatistics();
            if (response.success) {
                this.setStatistics(response.data);
            }
            return response;
        } catch (error) {
            console.error('加载统计数据失败:', error);
            throw error;
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
        }
        return response;
    },
    
    /**
     * 删除成绩
     */
    async deleteGrade(id) {
        const response = await GradeApi.deleteGrade(id);
        if (response.success) {
            if (this.grades.length === 1 && this.pagination.page > 1) {
                await this.loadGrades(this.pagination.page - 1);
            } else {
                await this.loadGrades(this.pagination.page);
            }
        }
        return response;
    },
    
    /**
     * 清空状态
     */
    clear() {
        this.grades = [];
        this.currentGrade = null;
        this.pagination = { page: 1, size: 10, total: 0, total_pages: 1 };
        this.keyword = '';
        this.minScore = null;
        this.maxScore = null;
        this.statistics = null;
    }
};

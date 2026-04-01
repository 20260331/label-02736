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
    filters: {
        keyword: '',
        min_score: null,
        max_score: null
    },
    loading: false,
    statisticsLoading: false,

    setGrades(grades, pagination) {
        this.grades = grades;
        if (pagination) {
            this.pagination = pagination;
        }
    },

    setCurrentGrade(grade) {
        this.currentGrade = grade;
    },

    setStatistics(statistics) {
        this.statistics = statistics;
    },

    setFilters(filters) {
        this.filters = { ...this.filters, ...filters };
    },

    async loadGrades(page = 1) {
        this.loading = true;
        try {
            const params = {
                page,
                size: this.pagination.size
            };

            if (this.filters.keyword) {
                params.keyword = this.filters.keyword;
            }
            if (this.filters.min_score !== null) {
                params.min_score = this.filters.min_score;
            }
            if (this.filters.max_score !== null) {
                params.max_score = this.filters.max_score;
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

    async loadStatistics() {
        this.statisticsLoading = true;
        try {
            const params = {};

            if (this.filters.keyword) {
                params.keyword = this.filters.keyword;
            }
            if (this.filters.min_score !== null) {
                params.min_score = this.filters.min_score;
            }
            if (this.filters.max_score !== null) {
                params.max_score = this.filters.max_score;
            }

            const response = await GradeApi.getStatistics(params);
            if (response.success) {
                this.setStatistics(response.data);
            }
            return response;
        } finally {
            this.statisticsLoading = false;
        }
    },

    async getGrade(id) {
        const response = await GradeApi.getGrade(id);
        if (response.success) {
            this.setCurrentGrade(response.data);
        }
        return response;
    },

    async createGrade(data) {
        const response = await GradeApi.createGrade(data);
        if (response.success) {
            await Promise.all([
                this.loadGrades(1),
                this.loadStatistics()
            ]);
        }
        return response;
    },

    async updateGrade(id, data) {
        const response = await GradeApi.updateGrade(id, data);
        if (response.success) {
            await Promise.all([
                this.loadGrades(this.pagination.page),
                this.loadStatistics()
            ]);
        }
        return response;
    },

    async deleteGrade(id) {
        const response = await GradeApi.deleteGrade(id);
        if (response.success) {
            if (this.grades.length === 1 && this.pagination.page > 1) {
                await this.loadGrades(this.pagination.page - 1);
            } else {
                await this.loadGrades(this.pagination.page);
            }
            await this.loadStatistics();
        }
        return response;
    },

    clear() {
        this.grades = [];
        this.currentGrade = null;
        this.statistics = null;
        this.pagination = { page: 1, size: 10, total: 0, total_pages: 1 };
        this.filters = { keyword: '', min_score: null, max_score: null };
    }
};

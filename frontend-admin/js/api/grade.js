/**
 * 成绩 API
 */
import { http } from './request.js';

export const GradeApi = {
    /**
     * 获取成绩列表
     */
    getGrades(params = {}) {
        return http.get('/grades', params);
    },

    /**
     * 获取成绩统计
     */
    getStatistics(params = {}) {
        return http.get('/grades/statistics', params);
    },

    /**
     * 获取单个成绩
     */
    getGrade(id) {
        return http.get(`/grades/${id}`);
    },

    /**
     * 创建成绩
     */
    createGrade(data) {
        return http.post('/grades', data);
    },

    /**
     * 更新成绩
     */
    updateGrade(id, data) {
        return http.put(`/grades/${id}`, data);
    },

    /**
     * 删除成绩
     */
    deleteGrade(id) {
        return http.delete(`/grades/${id}`);
    }
};

/**
 * 学生 API
 */
import { http } from './request.js';

export const StudentApi = {
    /**
     * 获取学生列表
     */
    getStudents(params = {}) {
        return http.get('/students', params);
    },

    /**
     * 获取单个学生
     */
    getStudent(id) {
        return http.get(`/students/${id}`);
    },

    /**
     * 创建学生
     */
    createStudent(data) {
        return http.post('/students', data);
    },

    /**
     * 更新学生
     */
    updateStudent(id, data) {
        return http.put(`/students/${id}`, data);
    },

    /**
     * 删除学生
     */
    deleteStudent(id) {
        return http.delete(`/students/${id}`);
    }
};

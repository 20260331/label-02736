/**
 * 班级 API
 */
import { http } from './request.js';

export const ClassApi = {
    /**
     * 获取所有班级
     */
    async getAll() {
        return http.get('/classes');
    },

    /**
     * 获取单个班级
     */
    async getById(id) {
        return http.get(`/classes/${id}`);
    },

    /**
     * 创建班级
     */
    async create(data) {
        return http.post('/classes', data);
    },

    /**
     * 更新班级
     */
    async update(id, data) {
        return http.put(`/classes/${id}`, data);
    },

    /**
     * 删除班级
     */
    async delete(id) {
        return http.delete(`/classes/${id}`);
    }
};

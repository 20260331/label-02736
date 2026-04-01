/**
 * 班级状态管理
 */
import { ClassApi } from '../api/class.js';

export const ClassStore = {
    classes: [],
    loading: false,
    
    /**
     * 设置班级列表
     */
    setClasses(classes) {
        this.classes = classes;
    },
    
    /**
     * 加载班级列表
     */
    async loadClasses() {
        this.loading = true;
        try {
            const response = await ClassApi.getAll();
            this.classes = response.data || [];
            return this.classes;
        } catch (error) {
            console.error('Failed to load classes:', error);
            throw error;
        } finally {
            this.loading = false;
        }
    },
    
    /**
     * 创建班级
     */
    async createClass(data) {
        const response = await ClassApi.create(data);
        await this.loadClasses();
        return response.data;
    },
    
    /**
     * 更新班级
     */
    async updateClass(id, data) {
        const response = await ClassApi.update(id, data);
        await this.loadClasses();
        return response.data;
    },
    
    /**
     * 删除班级
     */
    async deleteClass(id) {
        await ClassApi.delete(id);
        await this.loadClasses();
    },
    
    /**
     * 获取班级选项（用于下拉框）
     */
    getClassOptions() {
        return this.classes.map(c => ({
            value: c.name,
            label: c.name
        }));
    }
};

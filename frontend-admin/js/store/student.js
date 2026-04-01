/**
 * 学生状态管理
 */
import { StudentApi } from '../api/student.js';

export const StudentStore = {
    students: [],
    currentStudent: null,
    pagination: {
        page: 1,
        size: 10,
        total: 0,
        total_pages: 1
    },
    keyword: '',
    loading: false,
    
    /**
     * 设置学生列表
     */
    setStudents(students, pagination) {
        this.students = students;
        if (pagination) {
            this.pagination = pagination;
        }
    },
    
    /**
     * 设置当前学生
     */
    setCurrentStudent(student) {
        this.currentStudent = student;
    },
    
    /**
     * 设置搜索关键字
     */
    setKeyword(keyword) {
        this.keyword = keyword;
    },
    
    /**
     * 加载学生列表
     */
    async loadStudents(page = 1, keyword = null) {
        this.loading = true;
        try {
            const params = {
                page,
                size: this.pagination.size
            };
            
            if (keyword !== null) {
                this.keyword = keyword;
            }
            
            if (this.keyword) {
                params.keyword = this.keyword;
            }
            
            const response = await StudentApi.getStudents(params);
            if (response.success) {
                this.setStudents(response.data, response.pagination);
            }
            return response;
        } finally {
            this.loading = false;
        }
    },
    
    /**
     * 获取单个学生
     */
    async getStudent(id) {
        const response = await StudentApi.getStudent(id);
        if (response.success) {
            this.setCurrentStudent(response.data);
        }
        return response;
    },
    
    /**
     * 创建学生
     */
    async createStudent(data) {
        const response = await StudentApi.createStudent(data);
        if (response.success) {
            await this.loadStudents(1);
        }
        return response;
    },
    
    /**
     * 更新学生
     */
    async updateStudent(id, data) {
        const response = await StudentApi.updateStudent(id, data);
        if (response.success) {
            await this.loadStudents(this.pagination.page);
        }
        return response;
    },
    
    /**
     * 删除学生
     */
    async deleteStudent(id) {
        const response = await StudentApi.deleteStudent(id);
        if (response.success) {
            // 如果当前页没有数据了，回到上一页
            if (this.students.length === 1 && this.pagination.page > 1) {
                await this.loadStudents(this.pagination.page - 1);
            } else {
                await this.loadStudents(this.pagination.page);
            }
        }
        return response;
    },
    
    /**
     * 清空状态
     */
    clear() {
        this.students = [];
        this.currentStudent = null;
        this.pagination = { page: 1, size: 10, total: 0, total_pages: 1 };
        this.keyword = '';
    }
};

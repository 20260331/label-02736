/**
 * 学生表单视图（添加/编辑）
 */
import { StudentStore } from '../store/student.js';
import { ClassStore } from '../store/class.js';
import { Toast } from '../components/toast.js';

export class StudentFormView {
    constructor(container, studentId = null) {
        this.container = container;
        this.studentId = studentId;
        this.isEdit = !!studentId;
        this.student = null;
        this.classes = [];
        this.init();
    }

    async init() {
        this.renderLoading();
        try {
            // 加载班级列表
            await ClassStore.loadClasses();
            this.classes = ClassStore.classes || [];
            
            if (this.isEdit) {
                const response = await StudentStore.getStudent(this.studentId);
                if (response.success) {
                    this.student = response.data;
                    this.render();
                    this.bindEvents();
                } else {
                    Toast.error('学生不存在');
                    window.location.hash = '#/students';
                }
            } else {
                this.render();
                this.bindEvents();
            }
        } catch (error) {
            Toast.error('加载数据失败');
            window.location.hash = '#/students';
        }
    }

    renderLoading() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">编辑学生</h1>
            </div>
            <div class="page-content">
                <div class="loading-overlay" style="position: relative; height: 300px;">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;
    }

    render() {
        const title = this.isEdit ? '编辑学生' : '添加学生';
        const student = this.student || {};

        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">${title}</h1>
                <p class="page-desc">${this.isEdit ? '修改学生信息和成绩' : '录入新学生信息和成绩'}</p>
            </div>
            <div class="page-content">
                <div class="card" style="max-width: 600px;">
                    <div class="card-body">
                        <form id="studentForm">
                            <!-- 基本信息 -->
                            <div class="form-section">
                                <h4 class="form-section-title">基本信息</h4>
                                
                                <div class="form-group">
                                    <label class="form-label required">学号</label>
                                    <input type="text" class="form-control" id="student_id" 
                                        value="${student.student_id || ''}"
                                        placeholder="请输入学号" ${this.isEdit ? 'readonly' : ''}>
                                    <div class="form-error" id="student_id_error"></div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label required">姓名</label>
                                    <input type="text" class="form-control" id="name" 
                                        value="${student.name || ''}"
                                        placeholder="请输入姓名">
                                    <div class="form-error" id="name_error"></div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label">性别</label>
                                        <select class="form-control" id="gender">
                                            <option value="male" ${student.gender === 'male' ? 'selected' : ''}>男</option>
                                            <option value="female" ${student.gender === 'female' ? 'selected' : ''}>女</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">班级</label>
                                        <select class="form-control" id="class_name">
                                            <option value="">请选择班级</option>
                                            ${this.classes.map(cls => `
                                                <option value="${cls.name}" ${student.class_name === cls.name ? 'selected' : ''}>${cls.name}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 成绩信息 -->
                            <div class="form-section">
                                <h4 class="form-section-title">成绩信息</h4>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label required">语文成绩</label>
                                        <input type="number" class="form-control" id="chinese_score" 
                                            value="${student.chinese_score ?? ''}"
                                            min="0" max="100" step="0.1" placeholder="0-100" required>
                                        <div class="form-error" id="chinese_score_error"></div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label required">数学成绩</label>
                                        <input type="number" class="form-control" id="math_score" 
                                            value="${student.math_score ?? ''}"
                                            min="0" max="100" step="0.1" placeholder="0-100" required>
                                        <div class="form-error" id="math_score_error"></div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label required">英语成绩</label>
                                        <input type="number" class="form-control" id="english_score" 
                                            value="${student.english_score ?? ''}"
                                            min="0" max="100" step="0.1" placeholder="0-100" required>
                                        <div class="form-error" id="english_score_error"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 按钮 -->
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" id="cancelBtn">取消</button>
                                <button type="submit" class="btn btn-primary" id="submitBtn">
                                    ${this.isEdit ? '保存修改' : '添加学生'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('form-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'form-styles';
        style.textContent = `
            .form-section {
                margin-bottom: 32px;
            }
            
            .form-section-title {
                font-size: 14px;
                font-weight: 600;
                color: #172B4D;
                margin: 0 0 16px 0;
                padding-bottom: 8px;
                border-bottom: 1px solid #EEEEEE;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 16px;
            }
            
            .form-actions {
                display: flex;
                justify-content: flex-end;
                gap: 12px;
                padding-top: 24px;
                border-top: 1px solid #EEEEEE;
            }
            
            input[readonly] {
                background-color: #F8F9FA;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        const form = document.getElementById('studentForm');
        const cancelBtn = document.getElementById('cancelBtn');
        const submitBtn = document.getElementById('submitBtn');

        // 取消
        cancelBtn.addEventListener('click', () => {
            window.location.hash = '#/students';
        });

        // 提交
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // 清除错误
            document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
            document.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));

            // 获取数据
            const data = {
                student_id: document.getElementById('student_id').value.trim(),
                name: document.getElementById('name').value.trim(),
                gender: document.getElementById('gender').value,
                class_name: document.getElementById('class_name').value.trim(),
                chinese_score: parseFloat(document.getElementById('chinese_score').value) || 0,
                math_score: parseFloat(document.getElementById('math_score').value) || 0,
                english_score: parseFloat(document.getElementById('english_score').value) || 0
            };

            // 前端验证
            let hasError = false;

            // 学号验证：非空 + 只能包含字母和数字
            if (!this.isEdit) {
                if (!data.student_id) {
                    this.showError('student_id', '学号不能为空');
                    hasError = true;
                } else if (!/^[A-Za-z0-9]+$/.test(data.student_id)) {
                    this.showError('student_id', '学号只能包含字母和数字');
                    hasError = true;
                } else if (data.student_id.length > 20) {
                    this.showError('student_id', '学号不能超过20个字符');
                    hasError = true;
                }
            }

            // 姓名验证：非空 + 只能包含中文、字母、空格
            if (!data.name) {
                this.showError('name', '姓名不能为空');
                hasError = true;
            } else if (!/^[\u4e00-\u9fa5A-Za-z\s]+$/.test(data.name)) {
                this.showError('name', '姓名只能包含中文、字母和空格');
                hasError = true;
            } else if (data.name.length > 50) {
                this.showError('name', '姓名不能超过50个字符');
                hasError = true;
            }

            // 成绩验证：必填 + 数字 + 范围
            ['chinese_score', 'math_score', 'english_score'].forEach(field => {
                const inputValue = document.getElementById(field).value.trim();
                const fieldNames = { chinese_score: '语文成绩', math_score: '数学成绩', english_score: '英语成绩' };
                
                if (inputValue === '') {
                    this.showError(field, `${fieldNames[field]}不能为空`);
                    hasError = true;
                } else if (isNaN(data[field])) {
                    this.showError(field, '成绩必须是数字');
                    hasError = true;
                } else if (data[field] < 0 || data[field] > 100) {
                    this.showError(field, '成绩必须在 0-100 之间');
                    hasError = true;
                }
            });

            if (hasError) return;

            // 提交
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            try {
                if (this.isEdit) {
                    await StudentStore.updateStudent(this.studentId, data);
                    Toast.success('修改成功');
                } else {
                    await StudentStore.createStudent(data);
                    Toast.success('添加成功');
                }
                
                setTimeout(() => {
                    window.location.hash = '#/students';
                }, 500);
            } catch (error) {
                if (error.details && Array.isArray(error.details)) {
                    error.details.forEach(msg => Toast.error(msg));
                } else {
                    Toast.error(error.message || '操作失败');
                }
            } finally {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        });
    }

    showError(field, message) {
        const input = document.getElementById(field);
        const error = document.getElementById(`${field}_error`);
        if (input) input.classList.add('error');
        if (error) error.textContent = message;
    }

    destroy() {
        // 清理
    }
}

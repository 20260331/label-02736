/**
 * 成绩表单视图（添加/编辑）
 */
import { GradeStore } from '../store/grade.js';
import { Toast } from '../components/toast.js';

export class GradeFormView {
    constructor(container, gradeId = null) {
        this.container = container;
        this.gradeId = gradeId;
        this.isEdit = !!gradeId;
        this.grade = null;
        this.init();
    }

    async init() {
        this.renderLoading();
        try {
            if (this.isEdit) {
                const response = await GradeStore.getGrade(this.gradeId);
                if (response.success) {
                    this.grade = response.data;
                    this.render();
                    this.bindEvents();
                } else {
                    Toast.error('成绩不存在');
                    window.location.hash = '#/grades';
                }
            } else {
                this.render();
                this.bindEvents();
            }
        } catch (error) {
            Toast.error('加载数据失败');
            window.location.hash = '#/grades';
        }
    }

    renderLoading() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">编辑成绩</h1>
            </div>
            <div class="page-content">
                <div class="loading-overlay" style="position: relative; height: 300px;">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;
    }

    render() {
        const title = this.isEdit ? '编辑成绩' : '添加成绩';
        const grade = this.grade || {};

        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">${title}</h1>
                <p class="page-desc">${this.isEdit ? '修改成绩信息' : '录入新成绩'}</p>
            </div>
            <div class="page-content">
                <div class="card" style="max-width: 600px;">
                    <div class="card-body">
                        <form id="gradeForm">
                            <!-- 成绩信息 -->
                            <div class="form-section">
                                <h4 class="form-section-title">成绩信息</h4>
                                
                                <div class="form-group">
                                    <label class="form-label required">学号</label>
                                    <input type="text" class="form-control" id="student_id" 
                                        value="${grade.student_id || ''}"
                                        placeholder="请输入学号">
                                    <div class="form-error" id="student_id_error"></div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label required">姓名</label>
                                    <input type="text" class="form-control" id="name" 
                                        value="${grade.name || ''}"
                                        placeholder="请输入姓名">
                                    <div class="form-error" id="name_error"></div>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label required">课程名称</label>
                                    <input type="text" class="form-control" id="course_name" 
                                        value="${grade.course_name || ''}"
                                        placeholder="请输入课程名称">
                                    <div class="form-error" id="course_name_error"></div>
                                </div>
                                
                                <div class="form-row">
                                    <div class="form-group">
                                        <label class="form-label required">成绩分数</label>
                                        <input type="number" class="form-control" id="score" 
                                            value="${grade.score ?? ''}"
                                            min="0" max="100" step="0.1" placeholder="0-100" required>
                                        <div class="form-error" id="score_error"></div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label required">考试时间</label>
                                        <input type="date" class="form-control" id="exam_time" 
                                            value="${grade.exam_time || ''}">
                                        <div class="form-error" id="exam_time_error"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 按钮 -->
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" id="cancelBtn">取消</button>
                                <button type="submit" class="btn btn-primary" id="submitBtn">
                                    ${this.isEdit ? '保存修改' : '添加成绩'}
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
        `;
        document.head.appendChild(style);
    }

    bindEvents() {
        const form = document.getElementById('gradeForm');
        const cancelBtn = document.getElementById('cancelBtn');
        const submitBtn = document.getElementById('submitBtn');

        // 取消
        cancelBtn.addEventListener('click', () => {
            window.location.hash = '#/grades';
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
                course_name: document.getElementById('course_name').value.trim(),
                score: parseFloat(document.getElementById('score').value) || 0,
                exam_time: document.getElementById('exam_time').value.trim()
            };

            // 前端验证
            let hasError = false;

            // 学号验证
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

            // 姓名验证
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

            // 课程名称验证
            if (!data.course_name) {
                this.showError('course_name', '课程名称不能为空');
                hasError = true;
            } else if (data.course_name.length > 100) {
                this.showError('course_name', '课程名称不能超过100个字符');
                hasError = true;
            }

            // 成绩验证
            const scoreInput = document.getElementById('score').value.trim();
            if (scoreInput === '') {
                this.showError('score', '成绩分数不能为空');
                hasError = true;
            } else if (isNaN(data.score)) {
                this.showError('score', '成绩分数必须是数字');
                hasError = true;
            } else if (data.score < 0 || data.score > 100) {
                this.showError('score', '成绩分数必须在 0-100 之间');
                hasError = true;
            }

            // 考试时间验证
            if (!data.exam_time) {
                this.showError('exam_time', '考试时间不能为空');
                hasError = true;
            }

            if (hasError) return;

            // 提交
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            try {
                if (this.isEdit) {
                    await GradeStore.updateGrade(this.gradeId, data);
                    Toast.success('修改成功');
                } else {
                    await GradeStore.createGrade(data);
                    Toast.success('添加成功');
                }
                
                setTimeout(() => {
                    window.location.hash = '#/grades';
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
    }
}

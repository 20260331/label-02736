/**
 * 班级管理列表视图
 */
import { ClassStore } from '../store/class.js';
import { StudentStore } from '../store/student.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';

function escapeHtml(text) {
    if (text === null || text === undefined) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

export class ClassListView {
    constructor(container) {
        this.container = container;
        this.init();
    }

    async init() {
        this.renderLoading();
        try {
            await ClassStore.loadClasses();
            // 加载学生数据以统计各班人数
            await StudentStore.loadStudents(1, '', 1000);
            this.render();
            this.bindEvents();
        } catch (error) {
            console.error('Failed to load classes:', error);
            this.renderError();
        }
    }

    renderLoading() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">班级管理</h1>
                <p class="page-desc">管理班级信息</p>
            </div>
            <div class="page-content">
                <div class="loading-overlay" style="position: relative; height: 300px;">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;
    }

    renderError() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">班级管理</h1>
                <p class="page-desc">管理班级信息</p>
            </div>
            <div class="page-content">
                <div class="empty-state">
                    <h3 class="empty-state-title">加载失败</h3>
                    <p class="empty-state-desc">无法加载班级数据，请刷新页面重试</p>
                </div>
            </div>
        `;
    }

    getStudentCount(className) {
        const students = StudentStore.students || [];
        return students.filter(s => s.class_name === className).length;
    }

    render() {
        const classes = ClassStore.classes || [];

        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">班级管理</h1>
                <p class="page-desc">管理班级信息</p>
            </div>
            <div class="page-content">
                <div class="card">
                    <div class="card-body">
                        <!-- 工具栏 -->
                        <div class="toolbar">
                            <div class="toolbar-left"></div>
                            <div class="toolbar-right">
                                <button class="btn btn-primary" id="addClassBtn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                        <line x1="12" y1="5" x2="12" y2="19"/>
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                    添加班级
                                </button>
                            </div>
                        </div>
                        
                        <!-- 表格 -->
                        ${classes.length > 0 ? `
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>班级名称</th>
                                        <th>描述</th>
                                        <th>学生人数</th>
                                        <th>创建时间</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${classes.map(cls => `
                                        <tr data-id="${escapeHtml(cls.id)}">
                                            <td><strong>${escapeHtml(cls.name)}</strong></td>
                                            <td>${escapeHtml(cls.description) || '-'}</td>
                                            <td>${this.getStudentCount(cls.name)}</td>
                                            <td>${cls.created_at ? new Date(cls.created_at).toLocaleDateString() : '-'}</td>
                                            <td>
                                                <div class="table-actions">
                                                    <button class="btn btn-text btn-sm edit-btn" data-id="${escapeHtml(cls.id)}">
                                                        编辑
                                                    </button>
                                                    <button class="btn btn-text btn-sm delete-btn" data-id="${escapeHtml(cls.id)}" 
                                                        data-name="${escapeHtml(cls.name)}"
                                                        style="color: #FF5630;">
                                                        删除
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : `
                            <div class="empty-state">
                                <div class="empty-state-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                                    </svg>
                                </div>
                                <h3 class="empty-state-title">暂无班级数据</h3>
                                <p class="empty-state-desc">点击上方按钮添加第一个班级</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        // 添加班级
        document.getElementById('addClassBtn')?.addEventListener('click', () => {
            this.showClassModal();
        });

        // 编辑按钮
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                const cls = ClassStore.classes.find(c => c.id === id);
                if (cls) {
                    this.showClassModal(cls);
                }
            });
        });

        // 删除按钮
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                const name = e.target.dataset.name;
                const studentCount = this.getStudentCount(name);
                
                if (studentCount > 0) {
                    Toast.error(`该班级下有 ${studentCount} 名学生，无法删除`);
                    return;
                }

                const confirmed = await Modal.confirm({
                    title: '确认删除',
                    message: `确定要删除班级"${name}"吗？此操作不可恢复。`,
                    confirmText: '删除',
                    dangerous: true
                });

                if (confirmed) {
                    try {
                        await ClassStore.deleteClass(id);
                        Toast.success('删除成功');
                        this.render();
                        this.bindEvents();
                    } catch (error) {
                        Toast.error(error.message || '删除失败');
                    }
                }
            });
        });
    }

    async showClassModal(classInfo = null) {
        const isEdit = !!classInfo;
        const title = isEdit ? '编辑班级' : '添加班级';
        
        const content = `
            <form id="classForm" style="min-width: 300px;">
                <div class="form-group" style="margin-bottom: 16px;">
                    <label class="form-label required" style="display: block; margin-bottom: 8px; font-weight: 500;">班级名称</label>
                    <input type="text" class="form-control" id="className" 
                        value="${isEdit ? escapeHtml(classInfo.name) : ''}"
                        placeholder="请输入班级名称" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div class="form-group">
                    <label class="form-label" style="display: block; margin-bottom: 8px; font-weight: 500;">描述</label>
                    <input type="text" class="form-control" id="classDesc" 
                        value="${isEdit ? escapeHtml(classInfo.description || '') : ''}"
                        placeholder="请输入描述（可选）" style="width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
            </form>
        `;

        const overlay = Modal.show({
            title,
            content,
            footer: `
                <button class="btn btn-secondary" data-action="cancel">取消</button>
                <button class="btn btn-primary" data-action="confirm">${isEdit ? '保存' : '添加'}</button>
            `
        });

        const cancelBtn = overlay.querySelector('[data-action="cancel"]');
        const confirmBtn = overlay.querySelector('[data-action="confirm"]');
        const form = overlay.querySelector('#classForm');
        const nameInput = overlay.querySelector('#className');

        const handleSubmit = async () => {
            const name = document.getElementById('className').value.trim();
            const description = document.getElementById('classDesc').value.trim();

            if (!name) {
                Toast.error('班级名称不能为空', 2500);
                if (nameInput) nameInput.focus();
                return;
            }

            try {
                confirmBtn.disabled = true;
                if (isEdit) {
                    await ClassStore.updateClass(classInfo.id, { name, description });
                    Toast.success('修改成功');
                } else {
                    await ClassStore.createClass({ name, description });
                    Toast.success('添加成功');
                }
                Modal.close();
                this.render();
                this.bindEvents();
            } catch (error) {
                Toast.error(error.message || '操作失败', 2500);
            } finally {
                confirmBtn.disabled = false;
            }
        };

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => Modal.close());
        }

        if (confirmBtn) {
            confirmBtn.addEventListener('click', handleSubmit);
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                handleSubmit();
            });
        }

        if (nameInput) {
            nameInput.focus();
        }
    }

    destroy() {
        this.container.innerHTML = '';
    }
}

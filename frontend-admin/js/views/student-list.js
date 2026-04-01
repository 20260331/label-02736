/**
 * 学生列表视图
 */
import { StudentStore } from '../store/student.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';
import { escapeHtml } from '../utils/security.js';

export class StudentListView {
    constructor(container) {
        this.container = container;
        this.init();
    }

    async init() {
        this.renderLoading();
        try {
            await StudentStore.loadStudents(1);
            this.render();
            this.bindEvents();
        } catch (error) {
            Toast.error('加载数据失败');
            this.renderError();
        }
    }

    renderLoading() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">学生管理</h1>
                <p class="page-desc">管理学生信息和成绩</p>
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
                <h1 class="page-title">学生管理</h1>
                <p class="page-desc">管理学生信息和成绩</p>
            </div>
            <div class="page-content">
                <div class="empty-state">
                    <h3 class="empty-state-title">加载失败</h3>
                    <p class="empty-state-desc">无法加载学生数据，请刷新页面重试</p>
                </div>
            </div>
        `;
    }

    render() {
        const { students, pagination, keyword } = StudentStore;

        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">学生管理</h1>
                <p class="page-desc">管理学生信息和成绩</p>
            </div>
            <div class="page-content">
                <div class="card">
                    <div class="card-body">
                        <!-- 工具栏 -->
                        <div class="toolbar">
                            <div class="toolbar-left">
                                <div class="search-box">
                                    <span class="search-box-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="11" cy="11" r="8"/>
                                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                        </svg>
                                    </span>
                                    <input type="text" id="searchInput" placeholder="搜索学号、姓名、班级..." 
                                        value="${keyword || ''}">
                                </div>
                            </div>
                            <div class="toolbar-right">
                                <button class="btn btn-primary" id="addStudentBtn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                        <line x1="12" y1="5" x2="12" y2="19"/>
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                    添加学生
                                </button>
                            </div>
                        </div>
                        
                        <!-- 表格 -->
                        ${students.length > 0 ? `
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>学号</th>
                                        <th>姓名</th>
                                        <th>性别</th>
                                        <th>班级</th>
                                        <th>语文</th>
                                        <th>数学</th>
                                        <th>英语</th>
                                        <th>总分</th>
                                        <th>平均分</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${students.map(student => `
                                        <tr data-id="${escapeHtml(student.id)}">
                                            <td>${escapeHtml(student.student_id)}</td>
                                            <td>${escapeHtml(student.name)}</td>
                                            <td>${student.gender === 'male' ? '男' : '女'}</td>
                                            <td>${escapeHtml(student.class_name) || '-'}</td>
                                            <td>${escapeHtml(student.chinese_score)}</td>
                                            <td>${escapeHtml(student.math_score)}</td>
                                            <td>${escapeHtml(student.english_score)}</td>
                                            <td><strong>${escapeHtml(student.total_score)}</strong></td>
                                            <td>${escapeHtml(student.average_score)}</td>
                                            <td>
                                                <div class="table-actions">
                                                    <button class="btn btn-text btn-sm edit-btn" data-id="${escapeHtml(student.id)}">
                                                        编辑
                                                    </button>
                                                    <button class="btn btn-text btn-sm delete-btn" data-id="${escapeHtml(student.id)}" 
                                                        style="color: #FF5630;">
                                                        删除
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            
                            <!-- 分页 -->
                            <div class="pagination">
                                <button class="pagination-btn" id="prevPage" ${pagination.page <= 1 ? 'disabled' : ''}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                        <polyline points="15 18 9 12 15 6"/>
                                    </svg>
                                </button>
                                ${this.renderPageNumbers(pagination)}
                                <button class="pagination-btn" id="nextPage" ${pagination.page >= pagination.total_pages ? 'disabled' : ''}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                        <polyline points="9 18 15 12 9 6"/>
                                    </svg>
                                </button>
                                <span class="pagination-info">共 ${pagination.total} 条</span>
                            </div>
                        ` : `
                            <div class="empty-state">
                                <div class="empty-state-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                        <line x1="17" y1="11" x2="23" y2="11"/>
                                    </svg>
                                </div>
                                <h3 class="empty-state-title">${keyword ? '无匹配记录' : '暂无学生数据'}</h3>
                                <p class="empty-state-desc">${keyword ? '没有找到匹配的学生，请尝试其他关键字' : '点击上方按钮添加第一个学生'}</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    renderPageNumbers(pagination) {
        const { page, total_pages } = pagination;
        let pages = [];
        
        // 简单分页逻辑
        for (let i = 1; i <= total_pages; i++) {
            if (i === 1 || i === total_pages || (i >= page - 1 && i <= page + 1)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }

        return pages.map(p => {
            if (p === '...') {
                return '<span class="pagination-btn" style="cursor: default;">...</span>';
            }
            return `<button class="pagination-btn ${p === page ? 'active' : ''}" data-page="${p}">${p}</button>`;
        }).join('');
    }

    bindEvents() {
        // 搜索 - 使用 compositionend 处理中文输入法
        const searchInput = document.getElementById('searchInput');
        let searchTimer;
        let isComposing = false;
        
        searchInput?.addEventListener('compositionstart', () => {
            isComposing = true;
        });
        
        searchInput?.addEventListener('compositionend', (e) => {
            isComposing = false;
            // 输入法结束后触发搜索
            clearTimeout(searchTimer);
            searchTimer = setTimeout(async () => {
                await StudentStore.loadStudents(1, e.target.value);
                this.render();
                this.bindEvents();
            }, 300);
        });
        
        searchInput?.addEventListener('input', (e) => {
            // 如果正在使用输入法，不触发搜索
            if (isComposing) return;
            
            clearTimeout(searchTimer);
            searchTimer = setTimeout(async () => {
                await StudentStore.loadStudents(1, e.target.value);
                this.render();
                this.bindEvents();
            }, 300);
        });

        // 添加学生
        document.getElementById('addStudentBtn')?.addEventListener('click', () => {
            window.location.hash = '#/students/add';
        });

        // 编辑按钮
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                window.location.hash = `#/students/edit/${id}`;
            });
        });

        // 删除按钮
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                const confirmed = await Modal.confirm({
                    title: '确认删除',
                    message: '确定要删除这个学生吗？此操作不可恢复。',
                    confirmText: '删除',
                    dangerous: true
                });

                if (confirmed) {
                    try {
                        await StudentStore.deleteStudent(id);
                        Toast.success('删除成功');
                        this.render();
                        this.bindEvents();
                    } catch (error) {
                        Toast.error(error.message || '删除失败');
                    }
                }
            });
        });

        // 分页
        document.getElementById('prevPage')?.addEventListener('click', async () => {
            if (StudentStore.pagination.page > 1) {
                await StudentStore.loadStudents(StudentStore.pagination.page - 1);
                this.render();
                this.bindEvents();
            }
        });

        document.getElementById('nextPage')?.addEventListener('click', async () => {
            if (StudentStore.pagination.page < StudentStore.pagination.total_pages) {
                await StudentStore.loadStudents(StudentStore.pagination.page + 1);
                this.render();
                this.bindEvents();
            }
        });

        document.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const page = parseInt(e.target.dataset.page);
                if (page && page !== StudentStore.pagination.page) {
                    await StudentStore.loadStudents(page);
                    this.render();
                    this.bindEvents();
                }
            });
        });
    }

    destroy() {
        // 清理
    }
}

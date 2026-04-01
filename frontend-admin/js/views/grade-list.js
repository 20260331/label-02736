/**
 * 成绩列表视图
 */
import { GradeStore } from '../store/grade.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';
import { escapeHtml } from '../utils/security.js';

export class GradeListView {
    constructor(container) {
        this.container = container;
        this.init();
    }

    async init() {
        this.renderLoading();
        try {
            await Promise.all([
                GradeStore.loadGrades(1),
                GradeStore.loadStatistics()
            ]);
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
                <h1 class="page-title">成绩管理</h1>
                <p class="page-desc">管理学生成绩记录和统计分析</p>
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
                <h1 class="page-title">成绩管理</h1>
                <p class="page-desc">管理学生成绩记录和统计分析</p>
            </div>
            <div class="page-content">
                <div class="empty-state">
                    <h3 class="empty-state-title">加载失败</h3>
                    <p class="empty-state-desc">无法加载成绩数据，请刷新页面重试</p>
                </div>
            </div>
        `;
    }

    renderStatistics() {
        const { statistics } = GradeStore;
        if (!statistics) return '';

        const courseStats = Object.entries(statistics.by_course || {}).map(([course, stats]) => `
            <div class="stat-item">
                <div class="stat-label">${escapeHtml(course)}</div>
                <div class="stat-value">${stats.average}</div>
                <div class="stat-desc">最高: ${stats.max} / 最低: ${stats.min}</div>
            </div>
        `).join('');

        return `
            <div class="statistics-row">
                <div class="stat-card">
                    <div class="stat-card-title">整体统计</div>
                    <div class="stat-row">
                        <div class="stat-item">
                            <div class="stat-label">平均分</div>
                            <div class="stat-value">${statistics.average_score || 0}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">最高分</div>
                            <div class="stat-value">${statistics.max_score || 0}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">最低分</div>
                            <div class="stat-value">${statistics.min_score || 0}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">记录数</div>
                            <div class="stat-value">${statistics.total_count || 0}</div>
                        </div>
                    </div>
                </div>
                ${courseStats ? `
                    <div class="stat-card">
                        <div class="stat-card-title">按课程统计</div>
                        <div class="stat-row">
                            ${courseStats}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    render() {
        const { grades, pagination, filters } = GradeStore;
        const hasFilters = filters.keyword || filters.min_score !== null || filters.max_score !== null;

        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">成绩管理</h1>
                <p class="page-desc">管理学生成绩记录和统计分析</p>
            </div>
            <div class="page-content">
                ${this.renderStatistics()}
                
                <div class="card">
                    <div class="card-body">
                        <div class="toolbar">
                            <div class="toolbar-left">
                                <div class="search-box">
                                    <span class="search-box-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <circle cx="11" cy="11" r="8"/>
                                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                        </svg>
                                    </span>
                                    <input type="text" id="searchInput" placeholder="搜索学号、姓名、课程名称..." 
                                        value="${filters.keyword || ''}">
                                </div>
                                <div class="filter-group">
                                    <input type="number" id="minScore" placeholder="最低分" min="0" max="100"
                                        value="${filters.min_score !== null ? filters.min_score : ''}" style="width: 80px;">
                                    <span style="margin: 0 8px;">-</span>
                                    <input type="number" id="maxScore" placeholder="最高分" min="0" max="100"
                                        value="${filters.max_score !== null ? filters.max_score : ''}" style="width: 80px;">
                                    <button class="btn btn-secondary" id="applyFilter">筛选</button>
                                    ${hasFilters ? `<button class="btn btn-text" id="resetFilter">重置</button>` : ''}
                                </div>
                            </div>
                            <div class="toolbar-right">
                                <button class="btn btn-primary" id="addGradeBtn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                        <line x1="12" y1="5" x2="12" y2="19"/>
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                    录入成绩
                                </button>
                            </div>
                        </div>
                        
                        ${grades.length > 0 ? `
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>学号</th>
                                        <th>姓名</th>
                                        <th>课程名称</th>
                                        <th>成绩分数</th>
                                        <th>考试时间</th>
                                        <th>操作</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${grades.map(grade => `
                                        <tr data-id="${escapeHtml(grade.id)}">
                                            <td>${escapeHtml(grade.student_id)}</td>
                                            <td>${escapeHtml(grade.name)}</td>
                                            <td>${escapeHtml(grade.course_name)}</td>
                                            <td>
                                                <span class="score-badge ${grade.score >= 60 ? 'pass' : 'fail'}">
                                                    ${grade.score}
                                                </span>
                                                ${grade.from_student ? '<span class="source-badge" title="来自学生管理">学生</span>' : ''}
                                            </td>
                                            <td>${escapeHtml(grade.exam_time)}</td>
                                            <td>
                                                <div class="table-actions">
                                                    ${grade.from_student ? `
                                                        <span class="text-muted" style="font-size: 12px;">请在学生管理中编辑</span>
                                                    ` : `
                                                        <button class="btn btn-text btn-sm edit-btn" data-id="${escapeHtml(grade.id)}">
                                                            编辑
                                                        </button>
                                                        <button class="btn btn-text btn-sm delete-btn" data-id="${escapeHtml(grade.id)}" 
                                                            style="color: #FF5630;">
                                                            删除
                                                        </button>
                                                    `}
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                            
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
                                        <path d="M9 11l3 3L22 4"/>
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                    </svg>
                                </div>
                                <h3 class="empty-state-title">${hasFilters ? '无匹配记录' : '暂无成绩数据'}</h3>
                                <p class="empty-state-desc">${hasFilters ? '没有找到匹配的成绩记录，请尝试其他筛选条件' : '点击上方按钮录入第一条成绩'}</p>
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
        const searchInput = document.getElementById('searchInput');
        let searchTimer;
        let isComposing = false;
        
        searchInput?.addEventListener('compositionstart', () => {
            isComposing = true;
        });
        
        searchInput?.addEventListener('compositionend', (e) => {
            isComposing = false;
            clearTimeout(searchTimer);
            searchTimer = setTimeout(async () => {
                GradeStore.setFilters({ keyword: e.target.value });
                await Promise.all([
                    GradeStore.loadGrades(1),
                    GradeStore.loadStatistics()
                ]);
                this.render();
                this.bindEvents();
            }, 300);
        });
        
        searchInput?.addEventListener('input', (e) => {
            if (isComposing) return;
            
            clearTimeout(searchTimer);
            searchTimer = setTimeout(async () => {
                GradeStore.setFilters({ keyword: e.target.value });
                await Promise.all([
                    GradeStore.loadGrades(1),
                    GradeStore.loadStatistics()
                ]);
                this.render();
                this.bindEvents();
            }, 300);
        });

        document.getElementById('applyFilter')?.addEventListener('click', async () => {
            const minScore = document.getElementById('minScore')?.value;
            const maxScore = document.getElementById('maxScore')?.value;
            
            GradeStore.setFilters({
                min_score: minScore !== '' ? parseFloat(minScore) : null,
                max_score: maxScore !== '' ? parseFloat(maxScore) : null
            });
            
            await Promise.all([
                GradeStore.loadGrades(1),
                GradeStore.loadStatistics()
            ]);
            this.render();
            this.bindEvents();
        });

        document.getElementById('resetFilter')?.addEventListener('click', async () => {
            GradeStore.setFilters({
                keyword: '',
                min_score: null,
                max_score: null
            });
            
            await Promise.all([
                GradeStore.loadGrades(1),
                GradeStore.loadStatistics()
            ]);
            this.render();
            this.bindEvents();
        });

        document.getElementById('addGradeBtn')?.addEventListener('click', () => {
            window.location.hash = '#/grades/add';
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                window.location.hash = `#/grades/edit/${id}`;
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                const confirmed = await Modal.confirm({
                    title: '确认删除',
                    message: '确定要删除这条成绩记录吗？此操作不可恢复。',
                    confirmText: '删除',
                    dangerous: true
                });

                if (confirmed) {
                    try {
                        await GradeStore.deleteGrade(id);
                        Toast.success('删除成功');
                        this.render();
                        this.bindEvents();
                    } catch (error) {
                        Toast.error(error.message || '删除失败');
                    }
                }
            });
        });

        document.getElementById('prevPage')?.addEventListener('click', async () => {
            if (GradeStore.pagination.page > 1) {
                await GradeStore.loadGrades(GradeStore.pagination.page - 1);
                this.render();
                this.bindEvents();
            }
        });

        document.getElementById('nextPage')?.addEventListener('click', async () => {
            if (GradeStore.pagination.page < GradeStore.pagination.total_pages) {
                await GradeStore.loadGrades(GradeStore.pagination.page + 1);
                this.render();
                this.bindEvents();
            }
        });

        document.querySelectorAll('.pagination-btn[data-page]').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const page = parseInt(e.target.dataset.page);
                if (page && page !== GradeStore.pagination.page) {
                    await GradeStore.loadGrades(page);
                    this.render();
                    this.bindEvents();
                }
            });
        });
    }

    destroy() {
    }
}

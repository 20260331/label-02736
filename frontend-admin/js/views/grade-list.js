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
            await GradeStore.loadStatistics();
            await GradeStore.loadGrades(1);
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
                <p class="page-desc">管理学生成绩信息</p>
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
                <p class="page-desc">管理学生成绩信息</p>
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

        return `
            <div class="statistics-row">
                <div class="stat-card">
                    <div class="stat-card-value">${statistics.average}</div>
                    <div class="stat-card-label">平均分</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-value" style="color: #00B42A;">${statistics.highest}</div>
                    <div class="stat-card-label">最高分</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-value" style="color: #FF5630;">${statistics.lowest}</div>
                    <div class="stat-card-label">最低分</div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-value">${statistics.total}</div>
                    <div class="stat-card-label">总记录数</div>
                </div>
            </div>

            <div class="course-stats">
                <h4 class="stats-title">按课程统计</h4>
                <div class="course-stats-grid">
                    ${Object.entries(statistics.by_course).map(([course, stat]) => `
                        <div class="course-stat-card">
                            <div class="course-stat-name">${escapeHtml(course)}</div>
                            <div class="course-stat-row">
                                <span class="course-stat-label">平均分:</span>
                                <span class="course-stat-value">${stat.average}</span>
                            </div>
                            <div class="course-stat-row">
                                <span class="course-stat-label">最高分:</span>
                                <span class="course-stat-value" style="color: #00B42A;">${stat.highest}</span>
                            </div>
                            <div class="course-stat-row">
                                <span class="course-stat-label">最低分:</span>
                                <span class="course-stat-value" style="color: #FF5630;">${stat.lowest}</span>
                            </div>
                            <div class="course-stat-row">
                                <span class="course-stat-label">人数:</span>
                                <span class="course-stat-value">${stat.count}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    render() {
        const { grades, pagination, keyword, minScore, maxScore } = GradeStore;

        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">成绩管理</h1>
                <p class="page-desc">管理学生成绩信息</p>
            </div>
            <div class="page-content">
                <div class="card">
                    <div class="card-body">
                        <!-- 统计信息 -->
                        ${this.renderStatistics()}
                        
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
                                    <input type="text" id="searchInput" placeholder="搜索学号、姓名、课程..." 
                                        value="${keyword || ''}">
                                </div>
                                <div class="filter-group">
                                    <input type="number" class="filter-input" id="minScore" placeholder="最低分" 
                                        min="0" max="100" value="${minScore ?? ''}">
                                    <span class="filter-separator">-</span>
                                    <input type="number" class="filter-input" id="maxScore" placeholder="最高分" 
                                        min="0" max="100" value="${maxScore ?? ''}">
                                    <button class="btn btn-secondary btn-sm" id="filterBtn">筛选</button>
                                    <button class="btn btn-text btn-sm" id="resetFilterBtn">重置</button>
                                </div>
                            </div>
                            <div class="toolbar-right">
                                <button class="btn btn-primary" id="addGradeBtn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                                        <line x1="12" y1="5" x2="12" y2="19"/>
                                        <line x1="5" y1="12" x2="19" y2="12"/>
                                    </svg>
                                    添加成绩
                                </button>
                            </div>
                        </div>
                        
                        <!-- 表格 -->
                        ${grades.length > 0 ? `
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>学号</th>
                                        <th>姓名</th>
                                        <th>课程名称</th>
                                        <th>分数</th>
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
                                                <span class="score-badge ${grade.score >= 90 ? 'excellent' : grade.score >= 60 ? 'pass' : 'fail'}">
                                                    ${escapeHtml(grade.score)}
                                                </span>
                                            </td>
                                            <td>${escapeHtml(grade.exam_time) || '-'}</td>
                                            <td>
                                                <div class="table-actions">
                                                    <button class="btn btn-text btn-sm edit-btn" data-id="${escapeHtml(grade.id)}">
                                                        编辑
                                                    </button>
                                                    <button class="btn btn-text btn-sm delete-btn" data-id="${escapeHtml(grade.id)}" 
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
                                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/>
                                    </svg>
                                </div>
                                <h3 class="empty-state-title">${keyword || minScore !== null || maxScore !== null ? '无匹配记录' : '暂无成绩数据'}</h3>
                                <p class="empty-state-desc">${keyword || minScore !== null || maxScore !== null ? '没有找到匹配的成绩，请尝试其他筛选条件' : '点击上方按钮添加第一条成绩'}</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
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

    addStyles() {
        if (document.getElementById('grade-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'grade-styles';
        style.textContent = `
            .statistics-row {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 16px;
                margin-bottom: 24px;
            }
            
            .stat-card {
                padding: 20px;
                background: #F8F9FA;
                border-radius: 8px;
                border-left: 4px solid #0065FF;
                text-align: center;
            }
            
            .stat-card-value {
                font-size: 32px;
                font-weight: 700;
                line-height: 1;
                margin-bottom: 8px;
                color: #172B4D;
            }
            
            .stat-card-label {
                font-size: 12px;
                color: #6B778C;
                font-weight: 500;
            }
            
            .course-stats {
                margin-bottom: 32px;
            }
            
            .stats-title {
                font-size: 14px;
                font-weight: 600;
                color: #172B4D;
                margin: 0 0 16px 0;
            }
            
            .course-stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
            }
            
            .course-stat-card {
                padding: 16px;
                background: #F8F9FA;
                border-radius: 8px;
            }
            
            .course-stat-name {
                font-weight: 600;
                color: #172B4D;
                margin-bottom: 12px;
                padding-bottom: 8px;
                border-bottom: 1px solid #EAECEF;
            }
            
            .course-stat-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 6px;
                font-size: 13px;
            }
            
            .course-stat-label {
                color: #6B778C;
            }
            
            .course-stat-value {
                font-weight: 600;
                color: #172B4D;
            }
            
            .filter-group {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-left: 16px;
            }
            
            .filter-input {
                width: 80px;
                padding: 8px 12px;
                border: 1px solid #DFE1E6;
                border-radius: 6px;
                font-size: 14px;
            }
            
            .filter-input:focus {
                outline: none;
                border-color: #0065FF;
            }
            
            .filter-separator {
                color: #6B778C;
            }
            
            .score-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 600;
            }
            
            .score-badge.excellent {
                background: #E3FCEF;
                color: #006644;
            }
            
            .score-badge.pass {
                background: #E6FCFF;
                color: #0747A6;
            }
            
            .score-badge.fail {
                background: #FFEBE6;
                color: #BF2600;
            }
            
            .toolbar {
                flex-wrap: wrap;
                gap: 12px;
            }
        `;
        document.head.appendChild(style);
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
            clearTimeout(searchTimer);
            searchTimer = setTimeout(async () => {
                await GradeStore.loadGrades(1, e.target.value);
                this.render();
                this.bindEvents();
            }, 300);
        });
        
        searchInput?.addEventListener('input', (e) => {
            if (isComposing) return;
            
            clearTimeout(searchTimer);
            searchTimer = setTimeout(async () => {
                await GradeStore.loadGrades(1, e.target.value);
                this.render();
                this.bindEvents();
            }, 300);
        });

        // 筛选
        document.getElementById('filterBtn')?.addEventListener('click', async () => {
            const minScore = document.getElementById('minScore').value;
            const maxScore = document.getElementById('maxScore').value;
            await GradeStore.loadGrades(1, null,
                minScore ? parseFloat(minScore) : null,
                maxScore ? parseFloat(maxScore) : null
            );
            this.render();
            this.bindEvents();
        });

        // 重置筛选
        document.getElementById('resetFilterBtn')?.addEventListener('click', async () => {
            await GradeStore.loadGrades(1, '', null, null);
            this.render();
            this.bindEvents();
        });

        // 添加成绩
        document.getElementById('addGradeBtn')?.addEventListener('click', () => {
            window.location.hash = '#/grades/add';
        });

        // 编辑按钮
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.dataset.id;
                window.location.hash = `#/grades/edit/${id}`;
            });
        });

        // 删除按钮
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

        // 分页
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

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

    render() {
        const { grades, pagination, keyword, minScore, maxScore, statistics } = GradeStore;

        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">成绩管理</h1>
                <p class="page-desc">管理学生成绩信息</p>
            </div>
            <div class="page-content">
                <!-- 统计卡片 -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-value">${statistics?.total_count || 0}</div>
                        <div class="stat-card-label">总记录数</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${statistics?.average_score || 0}</div>
                        <div class="stat-card-label">平均分</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${statistics?.max_score || 0}</div>
                        <div class="stat-card-label">最高分</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card-value">${statistics?.min_score || 0}</div>
                        <div class="stat-card-label">最低分</div>
                    </div>
                </div>

                <!-- 课程统计 -->
                ${statistics?.course_stats && Object.keys(statistics.course_stats).length > 0 ? `
                    <div class="card" style="margin-bottom: 20px;">
                        <div class="card-body">
                            <h4 style="margin: 0 0 16px 0;">按课程统计</h4>
                            <div class="course-stats-grid">
                                ${Object.entries(statistics.course_stats).map(([course, stats]) => `
                                    <div class="course-stat-card">
                                        <div class="course-stat-title">${escapeHtml(course)}</div>
                                        <div class="course-stat-info">
                                            <div class="course-stat-item">
                                                <span class="course-stat-label">人数:</span>
                                                <span class="course-stat-value">${stats.count}</span>
                                            </div>
                                            <div class="course-stat-item">
                                                <span class="course-stat-label">平均:</span>
                                                <span class="course-stat-value">${stats.average}</span>
                                            </div>
                                            <div class="course-stat-item">
                                                <span class="course-stat-label">最高:</span>
                                                <span class="course-stat-value" style="color: #00B8D9;">${stats.max}</span>
                                            </div>
                                            <div class="course-stat-item">
                                                <span class="course-stat-label">最低:</span>
                                                <span class="course-stat-value" style="color: #FF5630;">${stats.min}</span>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}

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
                                    <input type="text" id="searchInput" placeholder="搜索学号、姓名、课程..." 
                                        value="${keyword || ''}">
                                </div>
                                <div class="filter-box">
                                    <input type="number" id="minScoreInput" placeholder="最低分" 
                                        value="${minScore ?? ''}" min="0" max="100" style="width: 90px;">
                                    <span style="margin: 0 8px;">-</span>
                                    <input type="number" id="maxScoreInput" placeholder="最高分" 
                                        value="${maxScore ?? ''}" min="0" max="100" style="width: 90px;">
                                    <button class="btn btn-secondary btn-sm" id="filterBtn">筛选</button>
                                    <button class="btn btn-text btn-sm" id="clearFilterBtn">清除</button>
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
                                        <th>成绩</th>
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
                                            <td><span class="score-badge ${this.getScoreBadgeClass(grade.score)}">${escapeHtml(grade.score)}</span></td>
                                            <td>${escapeHtml(grade.exam_time)}</td>
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
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                        <line x1="16" y1="13" x2="8" y2="13"/>
                                        <line x1="16" y1="17" x2="8" y2="17"/>
                                        <polyline points="10 9 9 9 8 9"/>
                                    </svg>
                                </div>
                                <h3 class="empty-state-title">${keyword || minScore || maxScore ? '无匹配记录' : '暂无成绩数据'}</h3>
                                <p class="empty-state-desc">${keyword || minScore || maxScore ? '没有找到匹配的成绩，请尝试其他筛选条件' : '点击上方按钮添加第一条成绩'}</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
    }

    getScoreBadgeClass(score) {
        if (score >= 90) return 'score-excellent';
        if (score >= 80) return 'score-good';
        if (score >= 60) return 'score-pass';
        return 'score-fail';
    }

    addStyles() {
        if (document.getElementById('grade-list-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'grade-list-styles';
        style.textContent = `
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 16px;
                margin-bottom: 20px;
            }
            
            .stat-card {
                background: white;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .stat-card-value {
                font-size: 32px;
                font-weight: 700;
                color: #172B4D;
                margin-bottom: 4px;
            }
            
            .stat-card-label {
                font-size: 14px;
                color: #6B778C;
            }
            
            .course-stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                gap: 16px;
            }
            
            .course-stat-card {
                background: #F8F9FA;
                border-radius: 8px;
                padding: 16px;
            }
            
            .course-stat-title {
                font-size: 16px;
                font-weight: 600;
                color: #172B4D;
                margin-bottom: 12px;
            }
            
            .course-stat-info {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
            }
            
            .course-stat-item {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            
            .course-stat-label {
                font-size: 13px;
                color: #6B778C;
            }
            
            .course-stat-value {
                font-size: 14px;
                font-weight: 600;
                color: #172B4D;
            }
            
            .filter-box {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-left: 16px;
            }
            
            .filter-box input {
                padding: 8px 12px;
                border: 1px solid #DFE1E6;
                border-radius: 6px;
                font-size: 14px;
            }
            
            .filter-box input:focus {
                outline: none;
                border-color: #00B8D9;
            }
            
            .score-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 12px;
                font-weight: 600;
                font-size: 14px;
            }
            
            .score-excellent {
                background: #E3FCEF;
                color: #00875A;
            }
            
            .score-good {
                background: #DEEBFF;
                color: #0747A6;
            }
            
            .score-pass {
                background: #FFF8E6;
                color: #FF8B00;
            }
            
            .score-fail {
                background: #FFEBE6;
                color: #DE350B;
            }
        `;
        document.head.appendChild(style);
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
                await this.doSearch();
            }, 300);
        });
        
        searchInput?.addEventListener('input', (e) => {
            if (isComposing) return;
            clearTimeout(searchTimer);
            searchTimer = setTimeout(async () => {
                await this.doSearch();
            }, 300);
        });

        // 筛选按钮
        document.getElementById('filterBtn')?.addEventListener('click', async () => {
            await this.doSearch();
        });

        // 清除筛选
        document.getElementById('clearFilterBtn')?.addEventListener('click', async () => {
            document.getElementById('minScoreInput').value = '';
            document.getElementById('maxScoreInput').value = '';
            document.getElementById('searchInput').value = '';
            GradeStore.setFilters('', null, null);
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
                        await GradeStore.loadStatistics();
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

    async doSearch() {
        const keyword = document.getElementById('searchInput')?.value || '';
        const minScore = document.getElementById('minScoreInput')?.value;
        const maxScore = document.getElementById('maxScoreInput')?.value;
        
        const minScoreVal = minScore !== '' ? parseFloat(minScore) : null;
        const maxScoreVal = maxScore !== '' ? parseFloat(maxScore) : null;
        
        GradeStore.setFilters(keyword, minScoreVal, maxScoreVal);
        await GradeStore.loadGrades(1, keyword, minScoreVal, maxScoreVal);
        this.render();
        this.bindEvents();
    }

    destroy() {
    }
}

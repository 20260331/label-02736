/**
 * 仪表盘视图
 */
import { StatisticsStore } from '../store/statistics.js';
import { Toast } from '../components/toast.js';
import { escapeHtml } from '../utils/security.js';

export class DashboardView {
    constructor(container) {
        this.container = container;
        this.init();
    }

    async init() {
        this.renderLoading();
        try {
            await StatisticsStore.loadAll();
            this.render();
        } catch (error) {
            Toast.error('加载数据失败');
            this.renderError();
        }
    }

    renderLoading() {
        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">数据概览</h1>
                <p class="page-desc">查看学生成绩统计数据</p>
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
                <h1 class="page-title">数据概览</h1>
                <p class="page-desc">查看学生成绩统计数据</p>
            </div>
            <div class="page-content">
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <h3 class="empty-state-title">加载失败</h3>
                    <p class="empty-state-desc">无法加载统计数据，请刷新页面重试</p>
                </div>
            </div>
        `;
    }

    render() {
        const stats = StatisticsStore.statistics;
        const ranking = StatisticsStore.ranking;

        if (!stats.has_data) {
            this.container.innerHTML = `
                <div class="page-header">
                    <h1 class="page-title">数据概览</h1>
                    <p class="page-desc">查看学生成绩统计数据</p>
                </div>
                <div class="page-content">
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="12" y1="18" x2="12" y2="12"/>
                                <line x1="9" y1="15" x2="15" y2="15"/>
                            </svg>
                        </div>
                        <h3 class="empty-state-title">暂无数据</h3>
                        <p class="empty-state-desc">还没有学生数据，请先添加学生信息</p>
                        <button class="btn btn-primary" onclick="window.location.hash='#/students/add'">
                            添加学生
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        this.container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">数据概览</h1>
                <p class="page-desc">查看学生成绩统计数据</p>
            </div>
            <div class="page-content">
                <!-- 统计卡片 -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card-icon primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                        <div class="stat-card-value">${stats.count}</div>
                        <div class="stat-card-label">学生总数</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-icon info">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="20" x2="18" y2="10"/>
                                <line x1="12" y1="20" x2="12" y2="4"/>
                                <line x1="6" y1="20" x2="6" y2="14"/>
                            </svg>
                        </div>
                        <div class="stat-card-value">${stats.average}</div>
                        <div class="stat-card-label">平均总分</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-icon primary">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                                <polyline points="17 6 23 6 23 12"/>
                            </svg>
                        </div>
                        <div class="stat-card-value">${stats.max}</div>
                        <div class="stat-card-label">最高总分</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-card-icon warning">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                                <polyline points="17 18 23 18 23 12"/>
                            </svg>
                        </div>
                        <div class="stat-card-value">${stats.min}</div>
                        <div class="stat-card-label">最低总分</div>
                    </div>
                </div>
                
                <!-- 科目平均分 -->
                <div class="card mt-lg">
                    <div class="card-header">
                        <h3 class="card-title">各科平均分</h3>
                    </div>
                    <div class="card-body">
                        <div class="subject-stats">
                            <div class="subject-stat">
                                <div class="subject-name">语文</div>
                                <div class="subject-bar">
                                    <div class="subject-bar-fill" style="width: ${Math.min(Math.max(stats.chinese_avg || 0, 0), 100)}%"></div>
                                </div>
                                <div class="subject-value">${stats.chinese_avg || 0}</div>
                            </div>
                            <div class="subject-stat">
                                <div class="subject-name">数学</div>
                                <div class="subject-bar">
                                    <div class="subject-bar-fill" style="width: ${Math.min(Math.max(stats.math_avg || 0, 0), 100)}%"></div>
                                </div>
                                <div class="subject-value">${stats.math_avg || 0}</div>
                            </div>
                            <div class="subject-stat">
                                <div class="subject-name">英语</div>
                                <div class="subject-bar">
                                    <div class="subject-bar-fill" style="width: ${Math.min(Math.max(stats.english_avg || 0, 0), 100)}%"></div>
                                </div>
                                <div class="subject-value">${stats.english_avg || 0}</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 成绩排名 -->
                <div class="card mt-lg">
                    <div class="card-header">
                        <h3 class="card-title">成绩排名 TOP 10</h3>
                    </div>
                    <div class="card-body" style="padding: 0;">
                        ${ranking.length > 0 ? `
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>排名</th>
                                        <th>学号</th>
                                        <th>姓名</th>
                                        <th>班级</th>
                                        <th>总分</th>
                                        <th>平均分</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${ranking.map(item => `
                                        <tr>
                                            <td>
                                                <span class="rank-badge ${item.rank <= 3 ? 'top' : ''}">${escapeHtml(item.rank)}</span>
                                            </td>
                                            <td>${escapeHtml(item.student_id)}</td>
                                            <td>${escapeHtml(item.name)}</td>
                                            <td>${escapeHtml(item.class_name) || '-'}</td>
                                            <td><strong>${escapeHtml(item.total_score)}</strong></td>
                                            <td>${escapeHtml(item.average_score)}</td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : `
                            <div class="table-empty">暂无排名数据</div>
                        `}
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
    }

    addStyles() {
        if (document.getElementById('dashboard-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'dashboard-styles';
        style.textContent = `
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 24px;
            }
            
            .subject-stats {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .subject-stat {
                display: flex;
                align-items: center;
                gap: 16px;
            }
            
            .subject-name {
                width: 60px;
                font-size: 14px;
                color: #6B778C;
            }
            
            .subject-bar {
                flex: 1;
                height: 12px;
                background: #F8F9FA;
                border-radius: 6px;
                overflow: hidden;
            }
            
            .subject-bar-fill {
                height: 100%;
                background: #36B37E;
                border-radius: 6px;
                transition: width 0.5s ease;
            }
            
            .subject-value {
                width: 50px;
                text-align: right;
                font-size: 14px;
                font-weight: 600;
                color: #172B4D;
            }
            
            .rank-badge {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                font-size: 12px;
                font-weight: 600;
                background: #F8F9FA;
                color: #6B778C;
            }
            
            .rank-badge.top {
                background: #36B37E;
                color: #fff;
            }
            
            .mt-lg {
                margin-top: 24px;
            }
        `;
        document.head.appendChild(style);
    }

    destroy() {
        // 清理
    }
}

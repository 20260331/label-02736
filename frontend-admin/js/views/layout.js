/**
 * 主布局视图
 */
import { AuthStore } from '../store/auth.js';
import { Toast } from '../components/toast.js';
import { Modal } from '../components/modal.js';

export class LayoutView {
    constructor(container) {
        this.container = container;
        this.currentRoute = '';
    }

    render(route) {
        this.currentRoute = route;
        
        this.container.innerHTML = `
            <div class="app-layout">
                <!-- 左侧导航 -->
                <nav class="nav-panel">
                    <div class="nav-logo">
                        <h1>
                            <span class="nav-logo-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                                </svg>
                            </span>
                            成绩管理
                        </h1>
                    </div>
                    
                    <div class="nav-menu">
                        <a class="nav-item ${route === 'dashboard' ? 'active' : ''}" href="#/dashboard">
                            <span class="nav-item-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="3" width="7" height="7"/>
                                    <rect x="14" y="3" width="7" height="7"/>
                                    <rect x="14" y="14" width="7" height="7"/>
                                    <rect x="3" y="14" width="7" height="7"/>
                                </svg>
                            </span>
                            数据概览
                        </a>
                        <a class="nav-item ${route.startsWith('students') ? 'active' : ''}" href="#/students">
                            <span class="nav-item-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                            </span>
                            学生管理
                        </a>
                        <a class="nav-item ${route.startsWith('classes') ? 'active' : ''}" href="#/classes">
                            <span class="nav-item-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                                </svg>
                            </span>
                            班级管理
                        </a>
                        <a class="nav-item ${route.startsWith('grades') ? 'active' : ''}" href="#/grades">
                            <span class="nav-item-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"/>
                                </svg>
                            </span>
                            成绩管理
                        </a>
                    </div>
                    
                    <div class="nav-footer">
                        <div class="nav-user">
                            <div class="nav-user-avatar">${AuthStore.getUserInitial()}</div>
                            <div class="nav-user-info">
                                <div class="nav-user-name">${AuthStore.user?.username || '用户'}</div>
                                <div class="nav-user-role">管理员</div>
                            </div>
                            <div class="nav-logout" id="logoutBtn" title="退出登录">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                    <polyline points="16 17 21 12 16 7"/>
                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </nav>
                
                <!-- 主内容区 -->
                <main class="main-content">
                    <!-- 顶部栏 -->
                    <header class="top-bar">
                        <div class="top-bar-left">
                            <button class="menu-toggle" id="menuToggle">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="3" y1="12" x2="21" y2="12"/>
                                    <line x1="3" y1="6" x2="21" y2="6"/>
                                    <line x1="3" y1="18" x2="21" y2="18"/>
                                </svg>
                            </button>
                            <nav class="breadcrumb">
                                ${this.renderBreadcrumb(route)}
                            </nav>
                        </div>
                        <div class="top-bar-right">
                            <div class="mobile-user-info">
                                <span class="mobile-username">${AuthStore.user?.username || '用户'}</span>
                                <button class="mobile-logout" id="mobileLogoutBtn" title="退出登录">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                        <polyline points="16 17 21 12 16 7"/>
                                        <line x1="21" y1="12" x2="9" y2="12"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </header>
                    
                    <!-- 页面内容 -->
                    <div id="page-container"></div>
                </main>
                
                <!-- 移动端遮罩 -->
                <div class="nav-overlay" id="navOverlay"></div>
            </div>
        `;

        this.bindEvents();
        return document.getElementById('page-container');
    }

    renderBreadcrumb(route) {
        const breadcrumbs = {
            'dashboard': [
                { text: '首页', active: true }
            ],
            'students': [
                { text: '首页', href: '#/dashboard' },
                { text: '学生管理', active: true }
            ],
            'students/add': [
                { text: '首页', href: '#/dashboard' },
                { text: '学生管理', href: '#/students' },
                { text: '添加学生', active: true }
            ],
            'students/edit': [
                { text: '首页', href: '#/dashboard' },
                { text: '学生管理', href: '#/students' },
                { text: '编辑学生', active: true }
            ],
            'classes': [
                { text: '首页', href: '#/dashboard' },
                { text: '班级管理', active: true }
            ],
            'grades': [
                { text: '首页', href: '#/dashboard' },
                { text: '成绩管理', active: true }
            ],
            'grades/add': [
                { text: '首页', href: '#/dashboard' },
                { text: '成绩管理', href: '#/grades' },
                { text: '添加成绩', active: true }
            ],
            'grades/edit': [
                { text: '首页', href: '#/dashboard' },
                { text: '成绩管理', href: '#/grades' },
                { text: '编辑成绩', active: true }
            ]
        };

        // 处理带参数的路由
        let key = route;
        if (route.startsWith('students/edit/')) {
            key = 'students/edit';
        }
        if (route.startsWith('grades/edit/')) {
            key = 'grades/edit';
        }

        const items = breadcrumbs[key] || breadcrumbs['dashboard'];
        
        return items.map((item, index) => {
            const separator = index > 0 ? `
                <span class="breadcrumb-separator">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                </span>
            ` : '';

            if (item.active) {
                return `${separator}<span class="breadcrumb-item active">${item.text}</span>`;
            }
            return `${separator}<a class="breadcrumb-item" href="${item.href}">${item.text}</a>`;
        }).join('');
    }

    bindEvents() {
        // 退出登录
        document.getElementById('logoutBtn')?.addEventListener('click', async () => {
            const confirmed = await Modal.confirm({
                title: '确认退出',
                message: '确定要退出登录吗？',
                confirmText: '退出'
            });

            if (confirmed) {
                await AuthStore.logout();
                Toast.success('已退出登录');
                window.location.hash = '#/login';
            }
        });

        // 移动端退出登录
        document.getElementById('mobileLogoutBtn')?.addEventListener('click', async () => {
            const confirmed = await Modal.confirm({
                title: '确认退出',
                message: '确定要退出登录吗？',
                confirmText: '退出'
            });

            if (confirmed) {
                await AuthStore.logout();
                Toast.success('已退出登录');
                window.location.hash = '#/login';
            }
        });

        // 移动端菜单切换
        const menuToggle = document.getElementById('menuToggle');
        const navPanel = document.querySelector('.nav-panel');
        const navOverlay = document.getElementById('navOverlay');

        menuToggle?.addEventListener('click', () => {
            navPanel?.classList.toggle('open');
            navOverlay?.classList.toggle('open');
        });

        // 点击遮罩关闭菜单
        navOverlay?.addEventListener('click', () => {
            navPanel?.classList.remove('open');
            navOverlay?.classList.remove('open');
        });

        // 点击菜单项后关闭菜单（移动端）
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    navPanel?.classList.remove('open');
                    navOverlay?.classList.remove('open');
                }
            });
        });
    }
}

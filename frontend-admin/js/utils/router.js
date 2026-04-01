/**
 * 简单路由系统
 */
import { AuthStore } from '../store/auth.js';
import { LoginView } from '../views/login.js';
import { LayoutView } from '../views/layout.js';
import { DashboardView } from '../views/dashboard.js';
import { StudentListView } from '../views/student-list.js';
import { StudentFormView } from '../views/student-form.js';
import { ClassListView } from '../views/class-list.js';
import { GradeListView } from '../views/grade-list.js';
import { GradeFormView } from '../views/grade-form.js';

export class Router {
    constructor() {
        this.container = document.getElementById('app');
        this.layout = new LayoutView(this.container);
        this.currentView = null;
    }

    init() {
        // 监听 hash 变化
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // 初始路由
        this.handleRoute();
    }

    navigate(path) {
        window.location.hash = `#/${path}`;
    }

    async handleRoute() {
        // 获取 hash，处理各种空值情况
        let hash = window.location.hash || '';
        
        // 移除开头的 #/ 或 # 
        if (hash.startsWith('#/')) {
            hash = hash.slice(2);
        } else if (hash.startsWith('#')) {
            hash = hash.slice(1);
        }
        
        // 处理空 hash 或只有斜杠的情况
        hash = hash.trim();
        if (!hash || hash === '/') {
            hash = 'login';
        }
        
        const [route, ...params] = hash.split('/').filter(Boolean);
        const finalRoute = route || 'login';

        // 销毁当前视图
        if (this.currentView && this.currentView.destroy) {
            this.currentView.destroy();
        }

        // 登录页面不需要认证
        if (finalRoute === 'login') {
            this.currentView = new LoginView(this.container);
            return;
        }

        // 检查认证
        const isAuthenticated = await AuthStore.checkAuth();
        if (!isAuthenticated) {
            this.navigate('login');
            return;
        }

        // 渲染布局并获取页面容器
        const fullRoute = params.length > 0 ? `${finalRoute}/${params.join('/')}` : finalRoute;
        const pageContainer = this.layout.render(fullRoute);

        // 根据路由渲染页面
        switch (finalRoute) {
            case 'dashboard':
                this.currentView = new DashboardView(pageContainer);
                break;
            
            case 'students':
                if (params[0] === 'add') {
                    this.currentView = new StudentFormView(pageContainer);
                } else if (params[0] === 'edit' && params[1]) {
                    this.currentView = new StudentFormView(pageContainer, params[1]);
                } else {
                    this.currentView = new StudentListView(pageContainer);
                }
                break;
            
            case 'classes':
                this.currentView = new ClassListView(pageContainer);
                break;
            
            case 'grades':
                if (params[0] === 'add') {
                    this.currentView = new GradeFormView(pageContainer);
                } else if (params[0] === 'edit' && params[1]) {
                    this.currentView = new GradeFormView(pageContainer, params[1]);
                } else {
                    this.currentView = new GradeListView(pageContainer);
                }
                break;
            
            default:
                this.navigate('dashboard');
                break;
        }
    }
}

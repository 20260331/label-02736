/**
 * 应用入口模块
 */
import { Router } from './utils/router.js';
import { AuthStore } from './store/auth.js';
import { Toast } from './components/toast.js';

// 初始化应用
class App {
    constructor() {
        this.router = new Router();
        this.init();
    }

    async init() {
        // 检查认证状态
        const isAuthenticated = await AuthStore.checkAuth();
        
        // 初始化路由
        this.router.init();
        
        // 获取当前 hash，处理空值情况
        const currentHash = window.location.hash || '';
        
        // 根据认证状态跳转
        if (!isAuthenticated && !currentHash.includes('login')) {
            this.router.navigate('login');
        } else if (isAuthenticated && (currentHash === '' || currentHash === '#' || currentHash === '#/' || currentHash.includes('login'))) {
            this.router.navigate('dashboard');
        }
    }
}

// 启动应用
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

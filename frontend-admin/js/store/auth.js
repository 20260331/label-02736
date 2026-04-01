/**
 * 认证状态管理
 */
import { AuthApi } from '../api/auth.js';
import { http } from '../api/request.js';

export const AuthStore = {
    isAuthenticated: false,
    user: null,
    
    /**
     * 设置认证状态
     */
    setAuth(user, token) {
        this.isAuthenticated = true;
        this.user = user;
        if (token) {
            http.setToken(token);
        }
    },
    
    /**
     * 清除认证状态
     */
    clearAuth() {
        this.isAuthenticated = false;
        this.user = null;
        http.removeToken();
    },
    
    /**
     * 检查认证状态
     */
    async checkAuth() {
        const token = http.getToken();
        if (!token) {
            this.clearAuth();
            return false;
        }
        
        try {
            const response = await AuthApi.checkAuth();
            if (response.data && response.data.authenticated) {
                this.setAuth(response.data.user);
                return true;
            }
            this.clearAuth();
            return false;
        } catch (error) {
            this.clearAuth();
            return false;
        }
    },
    
    /**
     * 登录
     */
    async login(username, password) {
        const response = await AuthApi.login(username, password);
        if (response.success && response.data) {
            this.setAuth(response.data.user, response.data.token);
            return response;
        }
        throw response;
    },
    
    /**
     * 退出
     */
    async logout() {
        try {
            await AuthApi.logout();
        } catch (error) {
            // 忽略退出错误
        }
        this.clearAuth();
    },
    
    /**
     * 获取用户名首字母
     */
    getUserInitial() {
        if (this.user && this.user.username) {
            return this.user.username.charAt(0).toUpperCase();
        }
        return 'U';
    }
};

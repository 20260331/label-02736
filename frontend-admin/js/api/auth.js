/**
 * 认证 API
 */
import { http } from './request.js';

export const AuthApi = {
    /**
     * 用户登录
     */
    login(username, password) {
        return http.post('/auth/login', { username, password });
    },

    /**
     * 用户退出
     */
    logout() {
        return http.post('/auth/logout');
    },

    /**
     * 检查认证状态
     */
    checkAuth() {
        return http.get('/auth/check');
    }
};

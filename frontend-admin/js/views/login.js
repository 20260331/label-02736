/**
 * 登录视图
 */
import { AuthStore } from '../store/auth.js';
import { Toast } from '../components/toast.js';

export class LoginView {
    constructor(container) {
        this.container = container;
        this.render();
        this.bindEvents();
    }

    render() {
        this.container.innerHTML = `
            <div class="login-page">
                <div class="login-container">
                    <div class="login-card">
                        <div class="login-header">
                            <div class="login-logo">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                                    <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                                </svg>
                            </div>
                            <h1 class="login-title">学生成绩管理系统</h1>
                            <p class="login-subtitle">请登录以继续使用系统</p>
                        </div>
                        
                        <form class="login-form" id="loginForm">
                            <div class="form-group">
                                <label class="form-label required">用户名</label>
                                <input type="text" class="form-control" id="username" 
                                    placeholder="请输入用户名" autocomplete="username">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label required">密码</label>
                                <input type="password" class="form-control" id="password" 
                                    placeholder="请输入密码" autocomplete="current-password">
                            </div>
                            
                            <button type="submit" class="btn btn-primary login-btn" id="loginBtn">
                                登录
                            </button>
                        </form>
                    </div>
                    
                    <div class="login-footer">
                        <p>©学生成绩管理系统</p>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const form = document.getElementById('loginForm');
        const loginBtn = document.getElementById('loginBtn');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;

            // 验证用户名
            if (!username) {
                Toast.warning('请输入用户名');
                document.getElementById('username').focus();
                return;
            }
            
            // 用户名长度验证（3-20字符）
            if (username.length < 3 || username.length > 20) {
                Toast.warning('用户名长度应为 3-20 个字符');
                document.getElementById('username').focus();
                return;
            }
            
            // 用户名格式验证（只允许字母、数字、下划线）
            if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                Toast.warning('用户名只能包含字母、数字和下划线');
                document.getElementById('username').focus();
                return;
            }

            // 验证密码
            if (!password) {
                Toast.warning('请输入密码');
                document.getElementById('password').focus();
                return;
            }
            
            // 密码长度验证（6-50字符）
            if (password.length < 6 || password.length > 50) {
                Toast.warning('密码长度应为 6-50 个字符');
                document.getElementById('password').focus();
                return;
            }

            // 登录
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;

            try {
                await AuthStore.login(username, password);
                Toast.success('登录成功');
                
                // 跳转到主页
                setTimeout(() => {
                    window.location.hash = '#/dashboard';
                }, 500);
            } catch (error) {
                Toast.error(error.message || '登录失败，请检查用户名和密码');
            } finally {
                loginBtn.classList.remove('loading');
                loginBtn.disabled = false;
            }
        });
    }

    destroy() {
        // 清理
    }
}

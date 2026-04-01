/**
 * HTTP 请求封装
 */
const API_BASE_URL = '/api';

class HttpClient {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    getToken() {
        return localStorage.getItem('token');
    }

    setToken(token) {
        localStorage.setItem('token', token);
    }

    removeToken() {
        localStorage.removeItem('token');
    }

    async request(url, options = {}) {
        const token = this.getToken();
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(`${this.baseURL}${url}`, config);
            
            // 处理非 JSON 响应
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                data = { error: { code: 'INVALID_RESPONSE', message: text || '服务器响应格式错误' } };
            }

            if (!response.ok) {
                // 处理认证错误
                if (response.status === 401) {
                    this.removeToken();
                    window.location.hash = '#/login';
                }
                
                // 处理服务器错误
                if (response.status >= 500) {
                    throw {
                        status: response.status,
                        code: 'SERVER_ERROR',
                        message: '服务器内部错误，请稍后重试'
                    };
                }
                
                // 处理请求超时
                if (response.status === 408) {
                    throw {
                        status: response.status,
                        code: 'TIMEOUT',
                        message: '请求超时，请稍后重试'
                    };
                }
                
                throw {
                    status: response.status,
                    ...(data.error || { code: 'REQUEST_FAILED', message: '请求失败' })
                };
            }

            return data;
        } catch (error) {
            // 已处理的错误直接抛出
            if (error.code) {
                throw error;
            }
            
            // 网络错误
            if (error instanceof TypeError && error.message.includes('fetch')) {
                throw {
                    code: 'NETWORK_ERROR',
                    message: '网络连接失败，请检查网络'
                };
            }
            
            // 其他未知错误
            throw {
                code: 'UNKNOWN_ERROR',
                message: error.message || '发生未知错误，请稍后重试'
            };
        }
    }

    get(url, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        return this.request(fullUrl, { method: 'GET' });
    }

    post(url, data = {}) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    put(url, data = {}) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    delete(url) {
        return this.request(url, { method: 'DELETE' });
    }
}

export const http = new HttpClient();

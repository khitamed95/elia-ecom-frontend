'use client';
import axios from 'axios';

// تحديد الـ base URL بناءً على البيئة
const NODE_ENV = process.env.NODE_ENV || 'development';
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.158:5000';

// Normalize base URL to avoid trailing '/api' which causes duplicated paths
const API_URL = RAW_API_URL.replace(/\/+$/, '').replace(/\/api$/, '');

// Log environment info (development only)
if (NODE_ENV === 'development') {
    console.log('🌍 Environment:', NODE_ENV);
    console.log('📡 API URL:', API_URL);
}

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
    // Normalize duplicate '/api' when baseURL already contains '/api'
    try {
        const base = config.baseURL || '';
        const url = config.url || '';
        if (base.endsWith('/api') && typeof url === 'string' && url.startsWith('/api')) {
            // Remove leading '/api' from the request URL, keep path after
            config.url = url.replace(/^\/api\/?/, '/');
        }
    } catch {}

    // إذا كان الطلب FormData، لا تضع Content-Type (المتصفح سيضعه تلقائياً مع boundary)
    if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    if (typeof window !== 'undefined') {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        let token = userInfo?.accessToken || userInfo?.token;
        if (token) {
            token = token.replace(/^"(.*)"$/, '$1').trim();
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const originalRequest = err.config;
        if (err.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                if (userInfo.refreshToken) {
                    const { data } = await api.post('/users/refresh-token', { refreshToken: userInfo.refreshToken });
                    userInfo.accessToken = data.accessToken;
                    localStorage.setItem('userInfo', JSON.stringify(userInfo));
                    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                    return api(originalRequest);
                }
            } catch (e) {
                localStorage.removeItem('userInfo');
                window.location.href = '/login';
            }
        }
        return Promise.reject(err);
    }
);

export default api;
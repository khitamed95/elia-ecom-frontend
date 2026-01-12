'use client';
import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
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
                    const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/users/refresh-token`, { refreshToken: userInfo.refreshToken });
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
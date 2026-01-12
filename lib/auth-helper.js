'use client';

export const isValidSession = () => {
    if (typeof window === 'undefined') return false;
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return !!(userInfo?.accessToken && userInfo?.id);
};

export const getCurrentUser = () => {
    if (typeof window === 'undefined') return null;
    try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        return {
            id: userInfo?.id,
            name: userInfo?.name,
            email: userInfo?.email,
            isAdmin: userInfo?.isAdmin,
            accessToken: userInfo?.accessToken, // ✅ استخدام accessToken بدل token
            token: userInfo?.accessToken // للتوافق مع الكود القديم
        };
    } catch { return null; }
};

export const handleAuthError = (error, context = '') => {
    const status = error.response?.status;
    
    if (status === 401 || status === 403) {
        // مسح بيانات المستخدم وإعادة التوجيه إلى الدخول
        if (typeof window !== 'undefined') {
            localStorage.removeItem('userInfo');
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        }
        return { isAuthError: true, shouldRetry: false };
    }
    
    return { 
        isAuthError: false, 
        message: error.response?.data?.message || error.message,
        status: status
    };
};
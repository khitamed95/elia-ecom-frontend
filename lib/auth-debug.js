'use client';

// أداة تصحيح مشاكل المصادقة والجلسات
export const authDebug = {
    // عرض معلومات التوكن الحالية
    showTokenInfo() {
        if (typeof window === 'undefined') return;
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        console.log('👤 User Info:', {
            id: userInfo?.id,
            email: userInfo?.email,
            hasAccessToken: !!userInfo?.accessToken,
            hasRefreshToken: !!userInfo?.refreshToken,
            accessTokenLength: userInfo?.accessToken?.length || 0,
            refreshTokenLength: userInfo?.refreshToken?.length || 0,
        });
        return userInfo;
    },

    // محاكاة انتهاء الجلسة (للاختبار)
    expireToken() {
        if (typeof window === 'undefined') return;
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        userInfo.accessToken = 'expired_token_' + Date.now();
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('⏰ Token artificially expired for testing');
    },

    // حذف جميع بيانات المستخدم
    clearAllData() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('userInfo');
        localStorage.removeItem('cart');
        localStorage.removeItem('favorites');
        console.log('🗑️ All user data cleared');
    },

    // تسجيل الدخول مجدداً (إذا كان لديك بيانات اختبار)
    loginForTesting(email = 'test@example.com', password = '123456') {
        console.log('🔑 Would need to call login endpoint with:', { email, password });
    },

    // عرض معلومات CORS والـ Headers
    showHeaders() {
        console.log('📋 Expected Headers:', {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer <token>',
            'x-auth-token': '<token>',
            'withCredentials': true
        });
    }
};

// تفعيل أداة التصحيح في الـ Console
if (typeof window !== 'undefined') {
    window.authDebug = authDebug;
    console.log('🛠️ Auth Debug Tool Available - Use window.authDebug.showTokenInfo() to debug');
}

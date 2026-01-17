// مفتاح كسر الكاش على مستوى الموديول، يتغير مع كل إعادة تحميل للمتصفح/التطبيق
const MODULE_CACHE_KEY = Date.now();

export const getImageUrl = (path, { cacheKey } = {}) => {
    // معالجة القيم الفارغة أو undefined
    if (!path || path === 'undefined' || path === 'null') return "/placeholder.svg";
    
    const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.158:5000/api';
    let finalUrl = '';
    
    // معالجة روابط تحتوي على /uploads/undefined
    if (typeof path === 'string' && path.includes('/uploads/undefined')) {
        return "/placeholder.svg";
    }
    
    // blob URLs و data URLs - أرجعها كما هي (بدون cache key)
    if (typeof path === 'string' && (path.startsWith('blob:') || path.startsWith('data:'))) {
        return path;
    }
    
    // معالجة مسارات Windows المحلية (C:\Users\...)
    if (typeof path === 'string' && path.includes('\\')) {
        const filename = path.split(/[\\\/]/).pop();
        if (!filename || filename === 'undefined') return "/placeholder.svg";
        const baseUrl = BASE.endsWith('/api') ? BASE.replace('/api', '') : BASE;
        finalUrl = `${baseUrl}/uploads/${filename}`;
    }
    // إذا كان الباك-أند أرسل الرابط كاملاً وصحيح
    else if (typeof path === 'string' && path.startsWith('http') && !path.includes('undefined')) {
        finalUrl = path;
    }
    // معالجة المسارات النسبية
    else if (typeof path === 'string' && path.startsWith('/') && !path.includes('undefined')) {
        if (path.includes('/uploads')) {
            const baseUrl = BASE.endsWith('/api') ? BASE.replace('/api', '') : BASE;
            finalUrl = `${baseUrl}${path}`;
        } else {
            finalUrl = `${BASE}${path}`;
        }
    }
    else {
        // احتياطاً للحالات الأخرى
        const cleanPath = String(path).replace(/^\/+/, '').replace(/^uploads\//, '');
        if (!cleanPath || cleanPath === 'undefined') return "/placeholder.svg";
        const baseUrl = BASE.endsWith('/api') ? BASE.replace('/api', '') : BASE;
        finalUrl = `${baseUrl}/uploads/${cleanPath}`;
    }

    // إضافة مفتاح كسر الكاش ما لم يكن الرابط blob/data
    if (!finalUrl.startsWith('blob:') && !finalUrl.startsWith('data:')) {
        let finalCacheKey = cacheKey;
        
        // إذا لم يُمرَّ cacheKey صراحة، استخرج timestamp من اسم الملف
        if (!finalCacheKey) {
            const filename = finalUrl.split('/').pop();
            const timestampMatch = filename?.match(/(\d{10,13})/);
            if (timestampMatch && timestampMatch[1]) {
                finalCacheKey = timestampMatch[1];
            }
        }
        
        // إذا تم تمرير cacheKey أو عثرنا على واحد، استخدمه
        if (finalCacheKey) {
            const sep = finalUrl.includes('?') ? '&' : '?';
            return `${finalUrl}${sep}v=${finalCacheKey}`;
        }
        
        // كحد أخير، أضف MODULE_CACHE_KEY للتأكد من عدم الكاش المفرط
        const sep = finalUrl.includes('?') ? '&' : '?';
        return `${finalUrl}${sep}v=${MODULE_CACHE_KEY}`;
    }
    return finalUrl;
};
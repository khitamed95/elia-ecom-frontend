export const getImageUrl = (path) => {
    // معالجة القيم الفارغة أو undefined
    if (!path || path === 'undefined' || path === 'null') return "/placeholder.svg";
    
    const BASE = process.env.NEXT_PUBLIC_API_URL;
    
    // معالجة روابط تحتوي على /uploads/undefined
    if (typeof path === 'string' && path.includes('/uploads/undefined')) {
        return "/placeholder.svg";
    }
    
    // معالجة مسارات Windows المحلية (C:\Users\...)
    if (typeof path === 'string' && path.includes('\\')) {
        const filename = path.split(/[\\\/]/).pop();
        if (!filename || filename === 'undefined') return "/placeholder.svg";
        return `${BASE}/uploads/${filename}`;
    }
    
    // إذا كان الباك-أند أرسل الرابط كاملاً وصحيح
    if (typeof path === 'string' && path.startsWith('http') && !path.includes('undefined')) {
        return path;
    }
    
    // معالجة المسارات النسبية
    if (typeof path === 'string' && path.startsWith('/') && !path.includes('undefined')) {
        return path;
    }

    // احتياطاً للحالات الأخرى
    const cleanPath = String(path).replace(/^\/+/, '').replace(/^uploads\//, '');
    if (!cleanPath || cleanPath === 'undefined') return "/placeholder.svg";
    return `${BASE}/uploads/${cleanPath}`;
};
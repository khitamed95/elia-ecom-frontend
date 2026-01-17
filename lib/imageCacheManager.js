/**
 * نظام إدارة cache للصور
 * يضمن تحديث الصور فوراً بعد التعديل
 */

// تخزين timestamps لكل منتج
const productImageTimestamps = new Map();

/**
 * تحديث timestamp لصور منتج معين
 */
export const updateProductImageTimestamp = (productId) => {
    const timestamp = Date.now();
    productImageTimestamps.set(String(productId), timestamp);
    
    // حفظ في localStorage للاحتفاظ بها بين الصفحات
    try {
        const stored = JSON.parse(localStorage.getItem('productImageTimestamps') || '{}');
        stored[productId] = timestamp;
        localStorage.setItem('productImageTimestamps', JSON.stringify(stored));
    } catch (e) {
        console.error('Error saving image timestamp:', e);
    }
    
    return timestamp;
};

/**
 * الحصول على timestamp لصور منتج معين
 */
export const getProductImageTimestamp = (productId) => {
    // محاولة الحصول من الذاكرة أولاً
    if (productImageTimestamps.has(String(productId))) {
        return productImageTimestamps.get(String(productId));
    }
    
    // محاولة الحصول من localStorage
    try {
        const stored = JSON.parse(localStorage.getItem('productImageTimestamps') || '{}');
        if (stored[productId]) {
            productImageTimestamps.set(String(productId), stored[productId]);
            return stored[productId];
        }
    } catch (e) {
        console.error('Error reading image timestamp:', e);
    }
    
    return null;
};

/**
 * مسح كل timestamps المحفوظة
 */
export const clearAllImageTimestamps = () => {
    productImageTimestamps.clear();
    try {
        localStorage.removeItem('productImageTimestamps');
    } catch (e) {
        console.error('Error clearing timestamps:', e);
    }
};

/**
 * بناء URL للصورة مع cache-busting
 */
export const buildImageUrlWithCache = (imagePath, productId, fallbackTimestamp) => {
    if (!imagePath) return '/placeholder.svg';
    
    // الحصول على timestamp محدد للمنتج أو استخدام fallback
    const cacheKey = getProductImageTimestamp(productId) || fallbackTimestamp || Date.now();
    
    // إذا كان الرابط يحتوي على ?v= بالفعل، استبدله
    let url = imagePath;
    if (url.includes('?v=')) {
        url = url.split('?v=')[0];
    }
    
    // إضافة cache-busting parameter
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${cacheKey}`;
};

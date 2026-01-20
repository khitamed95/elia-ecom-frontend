'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'react-toastify';
import Button from '@/components/Button';
import { 
    Save, ArrowRight, Package, ImageIcon, Loader2,
    Tag, Database, Layers, X, Link as LinkIcon, Ruler
} from 'lucide-react';

const SIZE_DATA = {
    // ملابس
    CLOTHING_MENS: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
    CLOTHING_WOMENS: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    CLOTHING_KIDS: ['2Y', '3Y', '4Y', '5Y', '6Y', '7Y', '8Y', '10Y', '12Y'],
    
    // أحذية
    SHOES_MENS: ['39', '40', '41', '42', '43', '44', '45', '46', '47'],
    SHOES_WOMENS: ['35', '36', '37', '38', '39', '40', '41', '42'],
    SHOES_KIDS: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34'],
    
    // إكسسوارات
    ACCESSORIES: ['One Size']
};

export default function EditProductPage() {
    const { id } = useParams();
    const router = useRouter();
    
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [uploadMethod, setUploadMethod] = useState('url');
    const [previews, setPreviews] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [imageErrors, setImageErrors] = useState({});
    const [cacheKey, setCacheKey] = useState(Date.now());
    const [externalUrls, setExternalUrls] = useState(['']); // روابط خارجية متعددة
    
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        oldPrice: 0,
        image: '',
        brand: 'ELIA',
        category: 'رجالي',
        productType: 'ملابس',
        availableSizes: [],
        countInStock: 0,
        description: '',
        isPopular: false,
        rating: 0,
        numReviews: 0
    });

    const getImageUrl = (path) => {
        if (!path) return "/placeholder.png";
        
        // blob URLs و data URLs تُرجع مباشرة
        if (path.startsWith('blob:') || path.startsWith('data:')) {
            return path;
        }
        
        const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.158:5000/api';
        let finalUrl = '';
        
        // روابط خارجية
        if (path.startsWith('http')) {
            finalUrl = path;
        } else if (path.startsWith('/')) {
            // إذا كان المسار يحتوي على /uploads، تأكد من عدم تكرار /api
            if (path.includes('/uploads')) {
                const baseUrl = BASE.endsWith('/api') ? BASE.replace('/api', '') : BASE;
                finalUrl = `${baseUrl}${path}`;
            } else {
                finalUrl = `${BASE}${path}`;
            }
        } else {
            // مسارات أخرى - افترض أنها تحتاج إلى /uploads
            const baseUrl = BASE.endsWith('/api') ? BASE.replace('/api', '') : BASE;
            finalUrl = `${baseUrl}/uploads/${path}`;
        }
        
        // إضافة مفتاح كاش لتجنب الصور القديمة من المتصفح
        const sep = finalUrl.includes('?') ? '&' : '?';
        return `${finalUrl}${sep}v=${cacheKey}`;
    };

    const getAvailableSizes = () => {
        // إكسسوارات دائماً One Size
        if (formData.productType === 'إكسسوارات') {
            return SIZE_DATA.ACCESSORIES;
        }
        
        // ملابس حسب الفئة
        if (formData.productType === 'ملابس') {
            if (formData.category === 'رجالي') return SIZE_DATA.CLOTHING_MENS;
            if (formData.category === 'نسائي') return SIZE_DATA.CLOTHING_WOMENS;
            if (formData.category === 'أطفال') return SIZE_DATA.CLOTHING_KIDS;
        }
        
        // أحذية حسب الفئة
        if (formData.productType === 'أحذية') {
            if (formData.category === 'رجالي') return SIZE_DATA.SHOES_MENS;
            if (formData.category === 'نسائي') return SIZE_DATA.SHOES_WOMENS;
            if (formData.category === 'أطفال') return SIZE_DATA.SHOES_KIDS;
        }
        
        return [];
    };

    const fetchProduct = useCallback(async () => {
        try {
            const { data } = await api.get(`/api/products/${id}`);
            
            console.log('📦 بيانات المنتج المُحملة:', {
                images: data.images,
                image: data.image,
                category: data.category
            });
            
            // استخراج نوع المنتج والفئة من category
            // القيمة قد تكون مثل "ملابس رجالي" أو "أحذية نسائي" إلخ
            let productType = 'ملابس';
            let category = 'رجالي';
            
            if (data.category) {
                const categoryText = String(data.category).trim();
                
                // البحث عن نوع المنتج
                if (categoryText.includes('ملابس')) {
                    productType = 'ملابس';
                } else if (categoryText.includes('أحذية')) {
                    productType = 'أحذية';
                } else if (categoryText.includes('إكسسوارات')) {
                    productType = 'إكسسوارات';
                }
                
                // البحث عن الفئة
                if (categoryText.includes('رجالي')) {
                    category = 'رجالي';
                } else if (categoryText.includes('نسائي')) {
                    category = 'نسائي';
                } else if (categoryText.includes('أطفال')) {
                    category = 'أطفال';
                }
            }
            
            setFormData({
                name: data.name ?? '',
                price: Number(data.price ?? 0),
                oldPrice: Number(data.oldPrice ?? 0),
                image: data.image ?? '',
                brand: data.brand ?? 'ELIA',
                category: category,
                productType: productType,
                availableSizes: data.availableSizes ?? [],
                countInStock: Number(data.countInStock ?? 0),
                description: data.description ?? '',
                isPopular: !!data.isPopular,
                rating: Number(data.rating ?? 0),
                numReviews: Number(data.numReviews ?? 0)
            });
            
            // تحديد الصور المراد عرضها
            const imagesToShow = data.images && data.images.length > 0 ? data.images : [data.image];
            console.log('🖼️ الصور المراد عرضها:', imagesToShow);
            setPreviews(imagesToShow);
            
            // تحديث الروابط الخارجية
            if (data.images && data.images.length > 0) {
                const urls = data.images.filter(img => img && typeof img === 'string' && img.startsWith('http'));
                setExternalUrls(urls.length > 0 ? urls : ['']);
            } else if (data.image && typeof data.image === 'string' && data.image.startsWith('http')) {
                setExternalUrls([data.image]);
            }
            
            setImageErrors({}); // امسح أي أخطاء سابقة
            setCacheKey(Date.now());
            setLoading(false);
        } catch (err) {
            console.error('❌ خطأ في جلب بيانات المنتج:', err);
            toast.error('خطأ في جلب بيانات المنتج');
            router.push('/admin/products');
        }
    }, [id, router]);

    useEffect(() => {
        if (id) fetchProduct();
    }, [id, fetchProduct]);

    useEffect(() => {
        // عند تغيير productType أو category، امسح القياسات القديمة وأضف فقط تلك المتاحة الحالية
        setFormData(prev => ({
            ...prev,
            availableSizes: []
        }));
    }, [formData.productType, formData.category]);

    const toggleSize = (size) => {
        setFormData(prev => ({
            ...prev,
            availableSizes: prev.availableSizes.includes(size)
                ? prev.availableSizes.filter(s => s !== size)
                : [...prev.availableSizes, size]
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const MAX_SIZE = 5 * 1024 * 1024; // 5MB per file
        
        console.log('📁 بدء رفع الملفات:', files.length);
        
        const validFiles = files.filter(file => {
            if (file.size > MAX_SIZE) {
                toast.warning(`الملف ${file.name} يتجاوز 5MB - تم تجاهله`);
                return false;
            }
            if (!file.type.startsWith('image/')) {
                toast.warning(`${file.name} ليس صورة - تم تجاهله`);
                return false;
            }
            return true;
        });
        
        if (validFiles.length === 0) {
            toast.error('لم يتم قبول أي ملفات صحيحة');
            return;
        }
        
        // تنظيف blob URLs القديمة لتجنب memory leaks
        previews.forEach(url => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
        
        setSelectedFiles(validFiles);
        // إنشاء blob URLs جديدة
        const newPreviews = validFiles.map(file => {
            const blobUrl = URL.createObjectURL(file);
            console.log('🖼️ تم إنشاء blob URL:', blobUrl);
            return blobUrl;
        });
        
        setPreviews(newPreviews);
        setImageErrors({}); // امسح أخطاء الصور السابقة
        setCacheKey(Date.now()); // تحديث مفتاح الكاش
        setUploadMethod('file');
        
        console.log('✅ تم تحميل', validFiles.length, 'صورة جديدة');
        console.log('📝 Blob URLs:', newPreviews);
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);

        // تحويل القيم الرقمية والتأكد من عدم إرسال فراغات تسبب أخطاء Prisma
        const payload = {
            name: formData.name.trim(),
            brand: formData.brand.trim() || 'ELIA',
            category: `${formData.productType} ${formData.category}`,
            description: formData.description || '',
            availableSizes: formData.availableSizes || [],
            isPopular: !!formData.isPopular,
            price: Number(formData.price) || 0,
            countInStock: Number(formData.countInStock) || 0,
            rating: formData.rating === '' ? 0 : Number(formData.rating) || 0,
            numReviews: formData.numReviews === '' ? 0 : Number(formData.numReviews) || 0,
        };

        if (formData.oldPrice !== '' && formData.oldPrice !== null && formData.oldPrice !== undefined) {
            const oldP = Number(formData.oldPrice);
            if (!Number.isNaN(oldP)) payload.oldPrice = oldP;
        }

        // إذا كان رفع ملفات نستخدم FormData، وإلا نرسل JSON
        if (uploadMethod === 'file') {
            const data = new FormData();
            Object.entries(payload).forEach(([k, v]) => {
                if (k === 'availableSizes') {
                    data.append(k, JSON.stringify(v));
                } else {
                    data.append(k, v);
                }
            });

            // إضافة جميع الملفات المختارة
            if (selectedFiles.length > 0) {
                selectedFiles.forEach(file => data.append('images', file));
            }

            console.log('📋 بيانات الإرسال:');
            console.log('- عدد الملفات:', selectedFiles.length);
            console.log('- الحقول:', Array.from(data.keys()));
            console.log('- uploadMethod:', uploadMethod);
            console.log('- API URL:', `${api.defaults.baseURL}/api/products/${id}`);

            try {
                console.log('📤 إرسال FormData إلى الخادم...');
                console.log('📦 عدد الملفات:', selectedFiles.length);
                
                const response = await api.put(`/api/products/${id}`, data);
                
                console.log('✅ تم الرفع بنجاح - الاستجابة:', {
                    images: response.data.images,
                    image: response.data.image,
                    status: response.status,
                    fullData: response.data
                });
                
                // 🔥 تحديث localStorage لإجبار تحديث الصور فوراً
                const newTimestamp = Date.now();
                localStorage.setItem(`img_ts_${id}`, newTimestamp.toString());
                console.log(`✅ تم تحديث timestamp للمنتج ${id}: ${newTimestamp}`);
                
                // اعرض الصور العائدة من الخادم
                let serverImages = [];
                if (response.data?.images && response.data.images.length > 0) {
                    serverImages = response.data.images;
                } else if (response.data?.image) {
                    serverImages = [response.data.image];
                } else {
                    // في حالة عدم وجود صور في الرد، استخدم الصور المحلية
                    console.warn('⚠️ لم يتم إرجاع صور من الخادم');
                    serverImages = previews;
                }
                
                console.log('🖼️ الصور النهائية:', serverImages);
                
                // تحديث المعاينة وإجبار re-render
                setPreviews(serverImages);
                setCacheKey(Date.now());
                setSelectedFiles([]);
                setImageErrors({}); // امسح أخطاء الصور
                
                toast.success('تم التحديث بنجاح ✨');

                // أطلق حدث لتحديث الصفحة الرئيسية والصفحات الأخرى
                window.dispatchEvent(new Event('productsUpdated'));

                // انتقل مباشرة لقائمة المنتجات بعد حفظ التغييرات
                setTimeout(() => {
                    router.push('/admin/products');
                }, 600);
            } catch (err) {
                console.error('❌ خطأ التحديث:', {
                    status: err.response?.status,
                    data: err.response?.data,
                    message: err.message,
                    fullError: err
                });
                
                // عرض رسالة خطأ مفصلة
                let errorMessage = 'فشل التحديث';
                if (err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                } else if (err.response?.data?.error) {
                    errorMessage = err.response.data.error;
                } else if (err.message) {
                    errorMessage = `خطأ: ${err.message}`;
                }
                
                toast.error(errorMessage, {
                    position: "top-center",
                    autoClose: 5000
                });
                
                console.log('💡 نصيحة: تحقق من Console للمزيد من التفاصيل');
            } finally {
                setUpdateLoading(false);
            }
        } else {
            // رفع عبر روابط مباشرة متعددة
            const validUrls = externalUrls.filter(url => url && url.trim().length > 0);
            const jsonPayload = { 
                ...payload, 
                image: validUrls[0] || '', 
                images: validUrls.length > 0 ? validUrls : undefined 
            };
            try {
                const response = await api.put(`/api/products/${id}`, jsonPayload);
                
                // 🔥 تحديث localStorage لإجبار تحديث الصور فوراً
                const newTimestamp = Date.now();
                localStorage.setItem(`img_ts_${id}`, newTimestamp.toString());
                console.log(`✅ تم تحديث timestamp للمنتج ${id}: ${newTimestamp}`);
                
                toast.success('تم التحديث بنجاح ✨');
                
                // تحديث المعاينة بالصور التي عادت من الخادم
                const newPreviews = response.data?.images || validUrls || previews;
                setPreviews(newPreviews);
                setCacheKey(Date.now());

                // أطلق حدث لتحديث الصفحة الرئيسية والصفحات الأخرى
                window.dispatchEvent(new Event('productsUpdated'));

                // انتقال سريع إلى صفحة المنتجات بعد الحفظ
                setTimeout(() => {
                    router.push('/admin/products');
                }, 600);
            } catch (err) {
                toast.error('فشل التحديث');
            } finally {
                setUpdateLoading(false);
            }
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={50}/></div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-12 font-sans" dir="rtl">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button 
                        onClick={() => router.push('/admin/products')}
                        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 font-bold mb-4 transition-colors"
                    >
                        <ArrowRight size={20} /> العودة للمنتجات
                    </button>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">تعديل المنتج</h1>
                    <p className="text-gray-500">قم بتحديث معلومات وتفاصيل المنتج</p>
                </div>

                <form onSubmit={submitHandler} className="space-y-6">
                    {/* معلومات أساسية */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <Package className="text-indigo-600" size={28} />
                            المعلومات الأساسية
                        </h2>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">اسم المنتج *</label>
                                <input 
                                    type="text" 
                                    value={formData.name} 
                                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-500 font-bold transition-colors" 
                                    placeholder="مثال: قميص رجالي كاجوال"
                                    required 
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">العلامة التجارية</label>
                                <input 
                                    type="text" 
                                    value={formData.brand} 
                                    onChange={(e) => setFormData({...formData, brand: e.target.value})} 
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-500 font-bold" 
                                    placeholder="ELIA"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">السعر (د.ع) *</label>
                                <input 
                                    type="number" 
                                    value={formData.price ?? 0} 
                                    onChange={(e) => setFormData({...formData, price: Number(e.target.value) || 0})} 
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-500 text-green-600 font-black text-xl" 
                                    placeholder="50000"
                                    required 
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">السعر القديم (اختياري)</label>
                                <input 
                                    type="number" 
                                    value={formData.oldPrice ?? 0} 
                                    onChange={(e) => setFormData({...formData, oldPrice: Number(e.target.value) || 0})} 
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-500 text-red-500 font-bold line-through" 
                                    placeholder="75000"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">نوع المنتج *</label>
                                <select 
                                    value={formData.productType} 
                                    onChange={(e) => {
                                        setFormData({...formData, productType: e.target.value});
                                    }}
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-500 font-bold"
                                    required
                                >
                                    <option value="ملابس">ملابس</option>
                                    <option value="أحذية">أحذية</option>
                                    <option value="إكسسوارات">إكسسوارات</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">الفئة *</label>
                                <select 
                                    value={formData.category} 
                                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-500 font-bold"
                                    required
                                >
                                    <option value="رجالي">رجالي</option>
                                    <option value="نسائي">نسائي</option>
                                    <option value="أطفال">أطفال</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">الكمية المتوفرة *</label>
                                <input 
                                    type="number" 
                                    value={formData.countInStock ?? 0} 
                                    onChange={(e) => setFormData({...formData, countInStock: Number(e.target.value) || 0})} 
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-500 font-bold" 
                                    placeholder="100"
                                    required 
                                />
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            <label className="text-sm font-bold text-gray-700">الوصف</label>
                            <textarea 
                                value={formData.description} 
                                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-500 font-medium resize-none h-32" 
                                placeholder="اكتب وصفاً تفصيلياً للمنتج..."
                            />
                        </div>
                    </div>

                    {/* المقاسات */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <Ruler className="text-indigo-600" size={28} />
                            المقاسات المتوفرة
                        </h2>
                        
                        <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-100">
                            <p className="text-sm font-black text-indigo-700 mb-4">
                                القياسات المتوفرة لـ {formData.productType} {formData.category}:
                            </p>
                            <div className="flex flex-wrap gap-3">
                                {getAvailableSizes().map(size => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => toggleSize(size)}
                                        className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${
                                            formData.availableSizes.includes(size)
                                                ? 'bg-indigo-600 text-white shadow-lg scale-105'
                                                : 'bg-white text-gray-600 hover:bg-indigo-100 hover:text-indigo-700'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* الصور */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <ImageIcon className="text-indigo-600" size={28} />
                            صور المنتج
                        </h2>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {previews.length > 0 ? previews.map((src, index) => {
                                // الحصول على URL النهائي
                                const imageUrl = getImageUrl(src);
                                const isBlob = src.startsWith('blob:');
                                
                                console.log(`🖼️ صورة ${index + 1}:`, { src, imageUrl, isBlob });
                                
                                return (
                                <div key={`preview-${index}-${cacheKey}`} className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md border-2 border-gray-100 bg-gray-100">
                                    {!imageErrors[index] ? (
                                        <img 
                                            src={imageUrl} 
                                            className="w-full h-full object-cover" 
                                            alt={`معاينة ${index + 1}`}
                                            loading="eager"
                                            onLoad={() => console.log(`✅ تم تحميل الصورة ${index + 1}`)}
                                            onError={(e) => {
                                                console.error(`❌ خطأ في تحميل الصورة ${index + 1}:`, e);
                                                setImageErrors(prev => ({...prev, [index]: true}));
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                                            <div className="text-center">
                                                <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                                                <p className="text-xs text-gray-500">صورة غير متاحة</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                );
                            }) : (
                                <div className="col-span-full text-center py-12">
                                    <ImageIcon className="mx-auto text-gray-300 mb-4" size={48} />
                                    <p className="text-gray-500">لا توجد صور للمعاينة</p>
                                </div>
                            )}
                        </div>

                        <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-4">
                            <button 
                                type="button" 
                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                                    uploadMethod === 'file' 
                                        ? 'bg-white text-indigo-600 shadow-md' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`} 
                                onClick={() => setUploadMethod('file')}
                            >
                                📁 رفع من الجهاز
                            </button>
                            <button 
                                type="button" 
                                className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                                    uploadMethod === 'url' 
                                        ? 'bg-white text-indigo-600 shadow-md' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`} 
                                onClick={() => setUploadMethod('url')}
                            >
                                🔗 رابط مباشر
                            </button>
                        </div>

                        {uploadMethod === 'file' && (
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*" 
                                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors cursor-pointer" 
                                onChange={handleFileChange} 
                            />
                        )}
                        
                        {uploadMethod === 'url' && (
                            <div className="space-y-3">
                                {externalUrls.map((url, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={url} 
                                            onChange={(e) => {
                                                const newUrls = [...externalUrls];
                                                newUrls[idx] = e.target.value;
                                                setExternalUrls(newUrls);
                                                // تحديث المعاينة فوراً
                                                if (e.target.value.trim()) {
                                                    setPreviews(newUrls.filter(u => u && u.trim().length > 0));
                                                }
                                            }} 
                                            className="flex-1 p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-500 font-mono text-sm" 
                                            dir="ltr" 
                                            placeholder={`رابط الصورة ${idx + 1} (https://...)`}
                                        />
                                        {externalUrls.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newUrls = externalUrls.filter((_, i) => i !== idx);
                                                    setExternalUrls(newUrls.length > 0 ? newUrls : ['']);
                                                    setPreviews(newUrls.filter(u => u && u.trim().length > 0));
                                                }}
                                                className="p-4 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors"
                                            >
                                                <X size={20} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => setExternalUrls([...externalUrls, ''])}
                                    className="w-full p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors font-bold flex items-center justify-center gap-2"
                                >
                                    <LinkIcon size={18} />
                                    إضافة رابط صورة آخر
                                </button>
                            </div>
                        )}
                    </div>

                    {/* إعدادات إضافية */}
                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
                        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                            <Layers className="text-indigo-600" size={28} />
                            إعدادات إضافية
                        </h2>
                        
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">التقييم</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    value={formData.rating ?? 0} 
                                    onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value) || 0})} 
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-500 font-bold" 
                                    placeholder="4.5"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">عدد التقييمات</label>
                                <input 
                                    type="number" 
                                    value={formData.numReviews ?? 0} 
                                    onChange={(e) => setFormData({...formData, numReviews: parseInt(e.target.value) || 0})} 
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-500 font-bold" 
                                    placeholder="150"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">منتج مميز</label>
                                <div className="flex items-center gap-4 h-full">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.isPopular} 
                                            onChange={(e) => setFormData({...formData, isPopular: e.target.checked})} 
                                            className="w-6 h-6 rounded-lg border-2 border-gray-300 checked:bg-indigo-600 checked:border-indigo-600 cursor-pointer"
                                        />
                                        <span className="font-bold text-gray-700">نعم، منتج مميز</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* أزرار الحفظ */}
                    <div className="flex gap-4">
                        <Button 
                            type="submit" 
                            disabled={updateLoading} 
                            variant="success"
                            size="lg"
                            loading={updateLoading}
                            className="flex-1"
                        >
                            <Save size={24} />
                            حفظ التعديلات
                        </Button>
                        
                        <Button 
                            type="button"
                            variant="secondary"
                            size="lg"
                            onClick={() => router.push('/admin/products')}
                        >
                            إلغاء
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
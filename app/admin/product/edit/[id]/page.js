'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'react-toastify';
import { 
    Save, ArrowRight, Loader2, Package, ImageIcon, 
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
    
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        oldPrice: '',
        image: '',
        brand: 'ELIA',
        category: 'رجالي',
        productType: 'ملابس',
        availableSizes: [],
        countInStock: '',
        description: '',
        isPopular: false,
        rating: 0,
        numReviews: 0
    });

    const getImageUrl = (path) => {
        if (!path) return "/placeholder.png";
        if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
        return `${process.env.NEXT_PUBLIC_API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
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
            const { data } = await api.get(`/products/${id}`);
            
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
                name: data.name || '',
                price: data.price || '',
                oldPrice: data.oldPrice || '',
                image: data.image || '',
                brand: data.brand || 'ELIA',
                category: category,
                productType: productType,
                availableSizes: data.availableSizes || [],
                countInStock: data.countInStock || 0,
                description: data.description || '',
                isPopular: data.isPopular || false,
                rating: data.rating || 0,
                numReviews: data.numReviews || 0
            });
            setPreviews(data.images && data.images.length > 0 ? data.images : [data.image]);
            setLoading(false);
        } catch (err) {
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
        setSelectedFiles(files);
        setPreviews(files.map(file => URL.createObjectURL(file)));
        setUploadMethod('file');
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

            if (selectedFiles.length > 0) {
                selectedFiles.forEach(file => data.append('images', file));
            }

            if (formData.image) data.append('image', formData.image);

            try {
                await api.put(`/products/${id}`, data);
                toast.success('تم التحديث بنجاح ✨');
                router.push('/admin/products');
            } catch (err) {
                toast.error('فشل التحديث');
            } finally {
                setUpdateLoading(false);
            }
        } else {
            // رفع عبر رابط مباشر
            const jsonPayload = { ...payload, image: formData.image || '' };
            try {
                await api.put(`/products/${id}`, jsonPayload);
                toast.success('تم التحديث بنجاح ✨');
                router.push('/admin/products');
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
                                    value={formData.price} 
                                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-500 text-green-600 font-black text-xl" 
                                    placeholder="50000"
                                    required 
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">السعر القديم (اختياري)</label>
                                <input 
                                    type="number" 
                                    value={formData.oldPrice} 
                                    onChange={(e) => setFormData({...formData, oldPrice: e.target.value})} 
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
                                    value={formData.countInStock} 
                                    onChange={(e) => setFormData({...formData, countInStock: e.target.value})} 
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
                            {previews.map((src, index) => (
                                <div key={index} className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md border-2 border-gray-100">
                                    <img src={getImageUrl(src)} className="w-full h-full object-cover" alt={`معاينة ${index + 1}`} />
                                </div>
                            ))}
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

                        {uploadMethod === 'file' ? (
                            <input 
                                type="file" 
                                multiple 
                                accept="image/*" 
                                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 hover:border-indigo-400 transition-colors cursor-pointer" 
                                onChange={handleFileChange} 
                            />
                        ) : (
                            <input 
                                type="text" 
                                value={formData.image} 
                                onChange={(e) => setFormData({...formData, image: e.target.value})} 
                                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-500 font-mono text-sm" 
                                dir="ltr" 
                                placeholder="https://images.unsplash.com/photo-..."
                            />
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
                                    value={formData.rating} 
                                    onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value) || 0})} 
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-gray-200 outline-none focus:border-indigo-500 font-bold" 
                                    placeholder="4.5"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">عدد التقييمات</label>
                                <input 
                                    type="number" 
                                    value={formData.numReviews} 
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
                        <button 
                            type="submit" 
                            disabled={updateLoading} 
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-2xl font-black text-xl hover:shadow-2xl hover:shadow-indigo-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {updateLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    جاري الحفظ...
                                </>
                            ) : (
                                <>
                                    <Save size={24} />
                                    حفظ التعديلات
                                </>
                            )}
                        </button>
                        
                        <button 
                            type="button"
                            onClick={() => router.push('/admin/products')}
                            className="px-8 py-5 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                        >
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
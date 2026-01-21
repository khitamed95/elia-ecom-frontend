'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useCart } from '@/context/CartContext';
import { 
    ShoppingBag, ChevronLeft, Star, ShieldCheck, 
    Truck, RotateCcw, Ruler, Loader2, Heart, Info
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function ProductDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('');
    const [activeImage, setActiveImage] = useState(0);
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const [allImages, setAllImages] = useState([]);
    const [sizes, setSizes] = useState([]); 
    const [colors, setColors] = useState([]);
    const [selectedColor, setSelectedColor] = useState('');
    const [isShoe, setIsShoe] = useState(false);
    const [isKidsShoe, setIsKidsShoe] = useState(false);
    const [liked, setLiked] = useState(false);
    const [cacheKey, setCacheKey] = useState(Date.now());
    // Ratings state
    const [reviews, setReviews] = useState([]);
    const [myRating, setMyRating] = useState(0);
    const [myComment, setMyComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [userId, setUserId] = useState(null);

    const checkIsShoe = (product) => {
        if (!product) return false;
        const fullText = `${product.name || ''} ${product.category || ''} ${product.description || ''}`.toLowerCase();
        const shoeKeywords = ['حذاء', 'أحذية', 'shoe', 'sneaker', 'boot', 'sandal', 'أحذية رياضية'];
        return shoeKeywords.some(keyword => fullText.includes(keyword));
    }

    const checkIsKidsShoe = (product) => {
        if (!product) return false;
        const fullText = `${product.name || ''} ${product.category || ''}`.toLowerCase();
        return (fullText.includes('أطفال') || fullText.includes('kids')) && checkIsShoe(product);
    }

    // Unified getImageUrl utility مع مفتاح كاش لتجنب الصور القديمة
    function getImageUrl(img) {
        if (!img || img === 'undefined' || img === 'null') return '/placeholder.svg';
        
        const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.158:5000/api';
        let finalUrl = '';
        
        // معالجة روابط تحتوي على undefined
        if (typeof img === 'string' && img.includes('/uploads/undefined')) {
            return '/placeholder.svg';
        }
        
        // معالجة مسارات Windows المحلية
        if (typeof img === 'string' && img.includes('\\')) {
            const filename = img.split(/[\\\/]/).pop();
            if (!filename || filename === 'undefined') return '/placeholder.svg';
            const baseUrl = BASE.endsWith('/api') ? BASE.replace('/api', '') : BASE;
            finalUrl = `${baseUrl}/uploads/${filename}`;
        } else if (typeof img === 'string' && img.startsWith('http') && !img.includes('undefined')) {
            finalUrl = img;
        } else if (typeof img === 'string' && img.startsWith('/')) {
            if (img.includes('/uploads')) {
                const baseUrl = BASE.endsWith('/api') ? BASE.replace('/api', '') : BASE;
                finalUrl = `${baseUrl}${img}`;
            } else {
                finalUrl = `${BASE}${img}`;
            }
        } else if (typeof img === 'object' && img.url) {
            return getImageUrl(img.url);
        } else if (typeof img === 'string') {
            const baseUrl = BASE.endsWith('/api') ? BASE.replace('/api', '') : BASE;
            finalUrl = `${baseUrl}/uploads/${img}`;
        }

        if (!finalUrl) return '/placeholder.svg';

        // إضافة مفتاح كاش لتجنب الصور القديمة
        if (!finalUrl.startsWith('blob:') && !finalUrl.startsWith('data:')) {
            const sep = finalUrl.includes('?') ? '&' : '?';
            return `${finalUrl}${sep}v=${cacheKey}`;
        }
        return finalUrl;
    }

    useEffect(() => {
        // capture current logged-in user id from localStorage
        try {
            const ui = JSON.parse(localStorage.getItem('userInfo') || '{}');
            setUserId(ui?.id || ui?._id || ui?.userId || null);
        } catch {}

        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/api/products/${id}`);
                setProduct(data);
                setIsShoe(checkIsShoe(data));
                setIsKidsShoe(checkIsKidsShoe(data));

                // Robust size extraction
                let extractedSizes = [];
                if (data.variants && data.variants.length > 0) {
                    extractedSizes = data.variants;
                } else if (Array.isArray(data.availableSizes) && data.availableSizes.length > 0) {
                    extractedSizes = data.availableSizes.map((size, idx) => ({ id: idx, size, stock: 99 }));
                } else if (Array.isArray(data.sizes) && data.sizes.length > 0) {
                    extractedSizes = data.sizes.map((size, idx) => ({ id: idx, size, stock: 99 }));
                } else if (Array.isArray(data.available_sizes) && data.available_sizes.length > 0) {
                    extractedSizes = data.available_sizes.map((size, idx) => ({ id: idx, size, stock: 99 }));
                }
                setSizes(extractedSizes);

                // Extract colors
                let extractedColors = [];
                if (Array.isArray(data.availableColors) && data.availableColors.length > 0) {
                    extractedColors = data.availableColors;
                } else if (Array.isArray(data.colors) && data.colors.length > 0) {
                    extractedColors = data.colors;
                } else if (Array.isArray(data.available_colors) && data.available_colors.length > 0) {
                    extractedColors = data.available_colors;
                }
                setColors(extractedColors);

                // Robust image extraction
                let images = [];
                if (data.images && Array.isArray(data.images) && data.images.length > 0) {
                    images = data.images;
                }
                if (data.image) {
                    images.unshift(data.image);
                }
                if (images.length === 0) {
                    images = ['/placeholder.svg'];
                }
                
                // بناء cache key من بيانات المنتج
                const productTimestamp = (() => {
                    const stamp = data?.updatedAt || data?.updated_at || data?.createdAt || data?.id;
                    if (!stamp) return undefined;
                    if (typeof stamp === 'string') {
                        const parsed = new Date(stamp).getTime();
                        return Number.isNaN(parsed) ? stamp : parsed;
                    }
                    return stamp;
                })();
                
                const resolvedImages = images.map(img => getImageUrl(img, { cacheKey: productTimestamp }));
                setAllImages(resolvedImages);
                setCacheKey(Date.now());
                setLoading(false);
                await loadReviews();
            } catch (err) {
                toast.error('لم يتم العثور على المنتج');
                router.push('/');
            }
        };
        fetchProduct();
    }, [id]);

    // Load product reviews
    const loadReviews = async () => {
        try {
            const { data } = await api.get(`/api/products/${id}/ratings`);
            const list = Array.isArray(data) ? data : (data?.reviews || []);
            setReviews(list);
            const uid = (userId || (() => { try { const ui = JSON.parse(localStorage.getItem('userInfo')||'{}'); return ui?.id || ui?._id || ui?.userId || null; } catch { return null; } })());
            if (uid) {
                const mine = list.find(r => (r?.user && (r.user.id === uid || r.user._id === uid)) || r?.userId === uid);
                if (mine) {
                    setMyRating(Number(mine.rating) || 0);
                    setMyComment(mine.comment || '');
                } else {
                    setMyRating(0);
                    setMyComment('');
                }
            }
        } catch (err) {
            console.error('fetch ratings error:', err);
        }
    };

    const handleSubmitRating = async () => {
        if (!userId) {
            toast.info('يرجى تسجيل الدخول للتقييم');
            router.push(`/login?redirect=/product/${id}`);
            return;
        }
        if (!myRating || myRating < 1 || myRating > 5) {
            toast.warn('اختر عدد النجوم من 1 إلى 5');
            return;
        }
        setSubmitting(true);
        try {
            await api.post(`/api/products/${id}/rate`, { rating: myRating, comment: myComment });
            toast.success('تم حفظ تقييمك');
            await loadReviews();
        } catch (err) {
            const msg = err?.response?.data?.message || 'فشل حفظ التقييم';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteRating = async () => {
        if (!userId) {
            toast.info('يرجى تسجيل الدخول');
            router.push(`/login?redirect=/product/${id}`);
            return;
        }
        setDeleting(true);
        try {
            await api.delete(`/api/products/${id}/rate`);
            toast.success('تم حذف تقييمك');
            setMyRating(0);
            setMyComment('');
            await loadReviews();
        } catch (err) {
            // fallback to possible alternative route
            try {
                await api.delete(`/api/products/${id}/ratings/me`);
                toast.success('تم حذف تقييمك');
                setMyRating(0);
                setMyComment('');
                await loadReviews();
            } catch (err2) {
                const msg = err?.response?.data?.message || err2?.response?.data?.message || 'فشل حذف التقييم';
                toast.error(msg);
            }
        } finally {
            setDeleting(false);
        }
    };

    const handleAddToCart = () => {
        if (sizes.length > 0 && !selectedSize) {
            toast.warn('يرجى اختيار المقاس أولاً');
            return;
        }
        if (colors.length > 0 && !selectedColor) {
            toast.warn('يرجى اختيار اللون أولاً');
            return;
        }
        
        try {
            const productToAdd = {
                ...product,
                _id: product._id || product.id,
                size: selectedSize,
                selectedSize: selectedSize,
                color: selectedColor,
                selectedColor: selectedColor
            };
            
            addToCart(productToAdd, 1);
        } catch (error) {
            toast.error('حدث خطأ أثناء إضافة المنتج');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <Loader2 className="animate-spin text-indigo-600" size={50} />
        </div>
    );

    return (
        <div className="min-h-screen bg-white pb-20 font-sans" dir="rtl">
            {/* التنقل العلوي */}
            <div className="container mx-auto px-6 py-4 flex items-center gap-2 text-sm font-bold text-gray-400">
                <span className="hover:text-black cursor-pointer" onClick={() => router.push('/')}>الرئيسية</span>
                <ChevronLeft size={14} />
                <span className="text-black">{product.name}</span>
            </div>

            <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* قسم الصور */}
                <div className="space-y-6">
                    <div className="aspect-[3/4] bg-gray-100 rounded-[3rem] overflow-hidden relative group shadow-2xl">
                        <img 
                            src={allImages[activeImage] || '/placeholder.svg'} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            alt={product.name}
                            onError={(e) => { e.target.src = '/placeholder.svg'; }}
                        />
                        <button onClick={() => setLiked(!liked)} className={`absolute top-8 left-8 p-4 rounded-full shadow-xl transition-all ${liked ? 'bg-red-500 text-white' : 'bg-white/80 hover:bg-red-500 hover:text-white'}`}>
                            <Heart size={24} fill={liked ? 'currentColor' : 'none'} />
                        </button>
                    </div>
                </div>

                {/* قسم المعلومات */}
                <div className="flex flex-col">

                        {/* Ratings & Reviews Section */}
                        <div className="mt-10 space-y-6">
                            <h3 className="text-2xl font-black flex items-center gap-3">
                                تقييمات المنتج
                                <span className="text-sm font-bold text-gray-500">(المتوسط: {Number(product?.rating || 0).toFixed(1)} / 5)</span>
                                {typeof product?.numReviews === 'number' && (
                                    <span className="text-xs font-bold text-gray-400">عدد التقيمات: {product.numReviews}</span>
                                )}
                            </h3>

                            {/* My rating editor */}
                            <div className="p-5 rounded-2xl border border-gray-100 bg-gray-50">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        {[...Array(5)].map((_, i) => (
                                            <button key={i} onClick={() => setMyRating(i + 1)} className="p-1">
                                                <Star size={20} fill={i < myRating ? '#fbbf24' : '#e5e7eb'} stroke="#fbbf24" />
                                            </button>
                                        ))}
                                    </div>
                                    {myRating > 0 && (
                                        <button onClick={handleDeleteRating} disabled={deleting} className="text-red-500 font-bold text-sm hover:underline">
                                            {deleting ? 'جارٍ الحذف...' : 'حذف تقييمي'}
                                        </button>
                                    )}
                                </div>
                                <textarea
                                    className="w-full p-4 rounded-xl border-2 border-transparent bg-white focus:border-indigo-600 outline-none font-bold text-sm"
                                    placeholder="اكتب تعليقك (اختياري)"
                                    rows={3}
                                    value={myComment}
                                    onChange={(e) => setMyComment(e.target.value)}
                                />
                                <div className="flex justify-end mt-3">
                                    <button onClick={handleSubmitRating} disabled={submitting} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black hover:bg-black transition-all">
                                        {submitting ? 'جارٍ الحفظ...' : (myRating > 0 ? 'حفظ التقييم' : 'اختر النجوم أولاً')}
                                    </button>
                                </div>
                                {!userId && (
                                    <p className="text-xs text-gray-400 mt-2">يجب تسجيل الدخول للتقييم. <a href={`/login?redirect=/product/${id}`} className="text-indigo-600 font-bold">تسجيل الدخول</a></p>
                                )}
                            </div>

                            {/* Reviews list */}
                            <div className="space-y-4">
                                {reviews.length === 0 && (
                                    <p className="text-gray-400 font-bold">لا توجد تقييمات بعد.</p>
                                )}
                                {reviews.map((rev, idx) => (
                                    <div key={rev.id || rev._id || idx} className="p-5 rounded-2xl border border-gray-100 bg-white">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="font-black text-gray-900">{rev?.user?.name || rev?.userName || 'مستخدم'}</div>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={16} fill={i < (rev?.rating || 0) ? '#fbbf24' : '#e5e7eb'} stroke="#fbbf24" />
                                                ))}
                                            </div>
                                        </div>
                                        {rev?.comment && <p className="text-sm text-gray-600 font-bold">{rev.comment}</p>}
                                        {rev?.createdAt && (
                                            <div className="text-[11px] text-gray-400 mt-2">{new Date(rev.createdAt).toLocaleDateString('ar-IQ')}</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    <div className="mb-6">
                        <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tighter uppercase leading-tight">
                            {product.name}
                        </h1>
                        <p className="text-3xl font-black text-indigo-600">
                            {Number(product.price).toLocaleString()} <span className="text-lg">د.ع</span>
                        </p>
                    </div>

                    <p className="text-gray-500 text-lg font-medium leading-relaxed mb-10">
                        {product.description}
                    </p>

                    {/* اختيار اللون */}
                    {colors.length > 0 && (
                        <div className="mb-8 space-y-4">
                            <h4 className="text-lg font-black text-gray-900 tracking-tight">اختر اللون</h4>
                            <div className="flex flex-wrap gap-3">
                                {colors.map((color, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedColor(color)}
                                        className={`px-6 py-3 rounded-xl font-bold transition-all border-2 cursor-pointer
                                            ${selectedColor === color
                                                ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg'
                                                : 'border-gray-200 bg-white text-gray-700 hover:border-indigo-400'
                                            }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* اختيار المقاس */}
                    <div className="mb-10 space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-black text-gray-900 tracking-tight">اختر المقاس</h4>
                            <button onClick={() => setShowSizeGuide(true)} className="text-indigo-600 font-bold text-sm flex items-center gap-1 hover:underline">
                                <Ruler size={16} /> جدول القياسات
                            </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-3">
                                                    {sizes.length > 0 ? (
                                                        sizes.map((item) => (
                                                            <button
                                                                key={item.id || item.size}
                                                                onClick={() => setSelectedSize(item.size)}
                                                                className={`min-w-[75px] h-16 rounded-2xl flex flex-col items-center justify-center font-black transition-all border-2 cursor-pointer
                                                                    ${selectedSize === item.size
                                                                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-xl shadow-indigo-100'
                                                                        : 'border-gray-100 bg-gray-50 text-gray-700 hover:border-indigo-400'
                                                                    }`}
                                                            >
                                                                <span className="text-xl">{item.size}</span>
                                                                {item.stock < 5 && item.stock > 0 && <span className="text-[9px] text-red-200">بقي {item.stock}</span>}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400 font-bold italic">يرجى التواصل مع الدعم للمقاسات</span>
                                                    )}
                        </div>
                    </div>

                    <button 
                        onClick={handleAddToCart}
                        className="w-full bg-black text-white py-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 hover:bg-indigo-600 transition-all shadow-2xl active:scale-95"
                    >
                        <ShoppingBag size={24} /> إضافة إلى السلة
                    </button>
                </div>
            </div>

        {/* ✅ مودال دليل القياسات - تصميم فلات، شامل، وبدون سكرول */}
{showSizeGuide && (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-2 animate-in fade-in duration-200" style={{ zIndex: 9999 }} onClick={() => setShowSizeGuide(false)}>
        <div 
            className="bg-white rounded-[2rem] overflow-hidden max-w-2xl w-full shadow-2xl flex flex-col" 
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header مبسط */}
            <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-black text-gray-900 tracking-tighter">
                    دليل القياسات الموحد {isKidsShoe ? '(أطفال)' : isShoe ? '(أحذية)' : '(ملابس)'}
                </h2>
                <button onClick={() => setShowSizeGuide(false)} className="text-gray-400 hover:text-black text-2xl">×</button>
            </div>

            {/* محتوى الجدول - تصميم فلات مكثف */}
            <div className="p-6">
                <div className="rounded-2xl border border-gray-100 overflow-hidden">
                    {isKidsShoe ? (
                        <table className="w-full text-center text-sm">
                            <thead className="bg-gray-900 text-white">
                                <tr className="font-bold">
                                    <th className="p-3">EU</th>
                                    <th className="p-3">UK</th>
                                    <th className="p-3">قدم (سم)</th>
                                    <th className="p-3">العمر</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold text-gray-600">
                                {[
                                    { eu: '24', uk: '7', cm: '15', age: '1.5-2 سنة' },
                                    { eu: '26', uk: '9', cm: '16', age: '2-3 سنوات' },
                                    { eu: '28', uk: '11', cm: '17.5', age: '3-4 سنوات' },
                                    { eu: '30', uk: '12.5', cm: '19', age: '5-6 سنوات' },
                                    { eu: '32', uk: '13.5', cm: '20', age: '7-8 سنوات' },
                                    { eu: '34', uk: '1', cm: '21.5', age: '9-10 سنوات' },
                                    { eu: '36', uk: '3', cm: '23', age: '11-12 سنة' },
                                ].map((row, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                        <td className="p-3 text-indigo-600 font-black">{row.eu}</td>
                                        <td className="p-3">{row.uk}</td>
                                        <td className="p-3">{row.cm}</td>
                                        <td className="p-3 text-gray-400 text-xs">{row.age}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : isShoe ? (
                        <table className="w-full text-center text-sm">
                            <thead className="bg-gray-900 text-white">
                                <tr className="font-bold">
                                    <th className="p-3">EU</th>
                                    <th className="p-3">UK</th>
                                    <th className="p-3">US</th>
                                    <th className="p-3">قدم (سم)</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold text-gray-600">
                                {[
                                    { eu: '38', uk: '4', us: '6', cm: '23.5' },
                                    { eu: '40', uk: '6', us: '8', cm: '25' },
                                    { eu: '42', uk: '8', us: '10', cm: '26.5' },
                                    { eu: '44', uk: '10', us: '12', cm: '27.5' },
                                    { eu: '45', uk: '11', us: '13', cm: '28.5' },
                                ].map((row, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                        <td className="p-3 text-indigo-600 font-black">{row.eu}</td>
                                        <td className="p-3">{row.uk}</td>
                                        <td className="p-3">{row.us}</td>
                                        <td className="p-3">{row.cm}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-center text-sm">
                            <thead className="bg-gray-900 text-white">
                                <tr className="font-bold">
                                    <th className="p-3">المقاس</th>
                                    <th className="p-3">الصدر (سم)</th>
                                    <th className="p-3">الخصر (سم)</th>
                                    <th className="p-3">الطول (سم)</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold text-gray-600">
                                {[
                                    { s: 'S', ch: '88-92', w: '72-76', l: '68' },
                                    { s: 'M', ch: '96-100', w: '80-84', l: '70' },
                                    { s: 'L', ch: '104-108', w: '88-92', l: '72' },
                                    { s: 'XL', ch: '112-116', w: '96-100', l: '74' },
                                    { s: 'XXL', ch: '120-124', w: '104-108', l: '76' },
                                ].map((row, i) => (
                                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                        <td className="p-3 text-indigo-600 font-black">{row.s}</td>
                                        <td className="p-3">{row.ch}</td>
                                        <td className="p-3">{row.w}</td>
                                        <td className="p-3">{row.l}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* نص التوصية - سطر واحد بسيط */}
                <div className="mt-5 flex items-center gap-3 text-gray-500 bg-gray-50 p-4 rounded-xl">
                    <Info size={18} className="text-indigo-600 shrink-0" />
                    <p className="text-[11px] font-bold leading-tight">
                        نوصي بقياس قطعة مماثلة لديك لضمان المقاس الأمثل. (فرق القياس الطبيعي 1-2 سم).
                    </p>
                </div>
            </div>

            {/* زر إغلاق سريع */}
            <div className="px-6 pb-6">
                <button 
                    onClick={() => setShowSizeGuide(false)}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all"
                >
                    موافق
                </button>
            </div>
        </div>
        </div>
         )}
        </div>
   
);
}
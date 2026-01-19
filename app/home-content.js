'use client';
import React, { useEffect, useState, useRef } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import Button from '@/components/Button';
import { ShoppingCart, ArrowLeft, Star, Sparkles, TrendingUp, Package, Zap, Shield, Truck, Plus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { getImageUrl } from '@/lib/imageUtil';
import { toast } from 'react-toastify';

// دالة للحصول على timestamp للصور من localStorage
function getImageTimestamp(productId) {
    if (typeof window === 'undefined') return null;
    try {
        const stored = localStorage.getItem(`img_ts_${productId}`);
        return stored || null;
    } catch (e) {
        return null;
    }
}

export function HomePageContent() {
    // تحديد الفصل الحالي تلقائياً
    function getCurrentSeason() {
        const month = new Date().getMonth() + 1;
        if (month >= 3 && month <= 5) return 'ربيع';
        if (month >= 6 && month <= 8) return 'صيف';
        if (month >= 9 && month <= 11) return 'خريف';
        return 'شتاء';
    }
    const currentYear = new Date().getFullYear();
    const currentSeason = getCurrentSeason();
    const searchParams = useSearchParams();
    const productsRef = useRef(null);
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('الكل');
    const [refreshKey, setRefreshKey] = useState(Date.now());

    const searchQuery = (searchParams.get('search') || '').trim();
    const isSearching = searchQuery.length > 0;

    const fetchProducts = async () => {
        try {
            const timestamp = Date.now();
            const { data } = await api.get('/api/products', { params: { _t: timestamp } });
            console.log('📦 Products fetched:', data.slice(0, 3).map(p => ({ name: p.name, category: p.category })));
            
            // حفظ timestamps للصور في localStorage لضمان تحديثها
            if (typeof window !== 'undefined') {
                data.forEach(product => {
                    // استخدم updatedAt من المنتج أو الوقت الحالي
                    const productTimestamp = product.updatedAt ? new Date(product.updatedAt).getTime() : timestamp;
                    localStorage.setItem(`img_ts_${product._id}`, productTimestamp.toString());
                });
            }
            
            setAllProducts(data);
            
            // تطبيق البحث إذا كان موجوداً
            if (isSearching) {
                const filtered = data.filter(p => 
                    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    p.category?.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setProducts(filtered);
            } else {
                setProducts(data);
            }
        } catch (error) { 
             // Silently ignore connection errors (backend not running)
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally { 
            setLoading(false); 
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [searchQuery, isSearching]);

    // استمع للأحداث والعودة للصفحة الرئيسية
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                // الصفحة أصبحت مرئية - أعد جلب البيانات بـ cache buster
                setRefreshKey(Date.now());
                fetchProducts();
            }
        };

        const handleProductsUpdated = () => {
            // استمع لحدث تحديث المنتجات من صفحات التعديل - أعد الجلب فوراً
            console.log('🔄 تم استقبال حدث تحديث المنتجات - جاري إعادة تحميل البيانات');
            setRefreshKey(Date.now()); // تحديث مفتاح كسر الكاش لإعادة تحميل الصور
            fetchProducts();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('productsUpdated', handleProductsUpdated);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('productsUpdated', handleProductsUpdated);
        };
    }, []);

    useEffect(() => {
        if (isSearching && productsRef.current) {
            productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isSearching]);

    // فلترة المنتجات حسب التصنيف
    const filterByCategory = (category) => {
        console.log('🔍 Filtering by category:', category);
        setSelectedCategory(category);
        if (category === 'الكل') {
            setProducts(allProducts);
        } else {
            const filtered = allProducts.filter(p => {
                if (!p.category) return false;
                const catStr = String(p.category).toLowerCase();
                // البحث في category عن كلمة مطابقة (مثل "نسائي" في "ملابس نسائي")
                const searchTerm = category.toLowerCase();
                let matches = false;
                if (searchTerm === 'نساء') {
                    // ابحث عن "نسائي" بدلاً من "نساء"
                    matches = catStr.includes('نسائي');
                } else if (searchTerm === 'رجال') {
                    // ابحث عن "رجالي" بدلاً من "رجال"
                    matches = catStr.includes('رجالي');
                } else if (searchTerm === 'أطفال') {
                    matches = catStr.includes('أطفال');
                } else if (searchTerm === 'إكسسوارات') {
                    matches = catStr.includes('إكسسوارات');
                } else {
                    matches = catStr.includes(searchTerm);
                }
                return matches;
            });
            console.log(`✅ Found ${filtered.length} products for category "${category}"`, filtered.map(p => ({ name: p.name, cat: p.category })));
            setProducts(filtered);
        }
    };

    // دالة للتمرير إلى قسم المنتجات
    const scrollToProducts = () => {
        setTimeout(() => {
            const productsSection = document.getElementById('products-section');
            if (productsSection) {
                const offset = 100;
                const elementPosition = productsSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    };

    // دالة معالجة التقييم
    const handleRating = async (productId, rating) => {
        // تعطيل مؤقت حتى يتم إضافة endpoint في الباك-اند
        toast.info('نظام التقييم قيد التطوير');
        return;
        
        /* سيتم تفعيله لاحقاً عند إضافة endpoint
        try {
            await api.post(`/api/products/${productId}/rate`, { rating });
            toast.success(`تم تقييم المنتج بـ ${rating} نجوم`);
            
            // تحديث التقييم محلياً
            setProducts(prev => prev.map(p => 
                p._id === productId ? { ...p, rating } : p
            ));
            setAllProducts(prev => prev.map(p => 
                p._id === productId ? { ...p, rating } : p
            ));
        } catch (error) {
            console.error('Rating error:', error);
            toast.error(error.response?.data?.message || 'فشل في تقييم المنتج');
        }
        */
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 text-[#1a1a1a]" dir="rtl">
            
            {/* 1. Hero Section المحسّن بتصميم عصري */}
            {!isSearching && (
            <header className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                {/* خلفية متحركة بتأثير Parallax */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-400 opacity-80"></div>
                    <img 
                        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=50&w=1200" 
                        className="w-full h-full object-cover mix-blend-overlay opacity-30" 
                        alt="Fashion Background"
                        loading="lazy"
                    />
                </div>

                {/* محتوى Hero */}
                <div className="relative z-10 text-center px-4 max-w-2xl">
                    <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full mb-6">
                        <span className="text-white text-sm font-semibold">{currentSeason} {currentYear} 🌟</span>
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-tight">
                        أناقة لا تُنسى
                    </h1>
                    
                    <p className="text-2xl text-white/90 mb-8 font-light">
                        اكتشف أحدث المجموعات من ماركات عالمية حصرية وتمتع بتجربة تسوق لا تُنسى
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button 
                            onClick={scrollToProducts}
                            variant="success"
                            size="lg"
                            className="shadow-2xl border-0"
                        >
                            <ShoppingCart size={20} />
                            تسوق الآن
                        </Button>
                        <Link 
                            href="#features"
                            className="w-full sm:w-auto"
                        >
                            <Button 
                                variant="outline"
                                size="lg"
                                className="w-full"
                            >
                                اكتشف المزايا
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>
            )}

            {/* قسم المنتجات */}
            <section id="products-section" ref={productsRef} className="py-20 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    {isSearching && (
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold mb-2">نتائج البحث</h2>
                            <p className="text-gray-600">وجدنا {products.length} منتجات تطابق "{searchQuery}"</p>
                        </div>
                    )}
                    
                    {!isSearching && (
                        <div>
                            <h2 className="text-5xl font-black mb-12 text-center">المنتجات المتاحة</h2>
                            
                            {/* فلاتر التصنيفات بأزرار جديدة */}
                            <div className="flex flex-wrap gap-3 justify-center mb-12">
                                {['الكل', 'نساء', 'رجال', 'أطفال', 'إكسسوارات'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => filterByCategory(cat)}
                                        className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                                            selectedCategory === cat 
                                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">لا توجد منتجات</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.map(product => {
                                // بناء cache key من timestamp المنتج والـ refreshKey
                                const productTimestamp = (() => {
                                    const stamp = product?.updatedAt || product?.updated_at || product?.createdAt || product?.id;
                                    if (!stamp) return undefined;
                                    if (typeof stamp === 'string') {
                                        const parsed = new Date(stamp).getTime();
                                        return Number.isNaN(parsed) ? stamp : parsed;
                                    }
                                    return stamp;
                                })();
                                // استخدم refreshKey كـ fallback لضمان تحديث الصور بعد التعديل
                                const cacheKey = productTimestamp || refreshKey;
                                return (
                                <div key={product.id} className="group">
                                    <div className="relative overflow-hidden rounded-2xl bg-gray-200 h-64 mb-4 shadow-lg hover:shadow-2xl transition-all duration-300">
                                        <img 
                                            src={getImageUrl(product.image, { cacheKey })} 
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                                            {product.discount}%
                                        </div>
                                        
                                        {/* أضف إلى السلة - يظهر عند hover */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                            <Link href={`/product/${product.id}`} className="w-full">
                                                <Button 
                                                    variant="success" 
                                                    size="lg" 
                                                    className="w-full"
                                                >
                                                    <Plus size={24} />
                                                    أضف إلى السلة
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                    
                                    <Link href={`/product/${product.id}`}>
                                        <div className="cursor-pointer hover:text-indigo-600 transition-colors">
                                            <h3 className="font-extrabold text-lg md:text-xl tracking-tight mb-2 line-clamp-2">{product.name}</h3>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex gap-2">
                                                    <span className="font-bold text-indigo-600 text-lg">{product.price} د.ع</span>
                                                    {product.originalPrice && (
                                                        <span className="line-through text-gray-400 text-sm">{product.originalPrice} د.ع</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    {/* نظام التقييم التفاعلي - منفصل عن الرابط */}
                                    <div 
                                        className="flex gap-1 justify-end -mt-2 mb-2"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                size={14} 
                                                className="cursor-pointer hover:scale-125 transition-transform"
                                                fill={i < Math.floor(product.rating || 0) ? '#fbbf24' : '#e5e7eb'}
                                                stroke="#fbbf24"
                                                onClick={() => handleRating(product.id, i + 1)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div id="features" className="max-w-7xl mx-auto px-4">
                    <h2 className="text-5xl font-black text-center mb-12">لماذا تختار إيليا؟</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Zap, title: 'توصيل سريع', desc: 'توصيل في أقل من 48 ساعة' },
                            { icon: Shield, title: 'آمن وموثوق', desc: 'دفع آمن وضمان استرجاع النقود' },
                            { icon: Package, title: 'تغليف فاخر', desc: 'تغليف هدايا مجاني لجميع الطلبات' },
                            { icon: TrendingUp, title: 'أحدث الموضات', desc: 'تحديث يومي للمجموعات الجديدة' }
                        ].map((feature, i) => (
                            <div key={i} className="text-center">
                                <feature.icon size={48} className="mx-auto text-indigo-600 mb-4" />
                                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                                <p className="text-gray-600 text-sm">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold text-lg mb-4">إيليا ستور</h3>
                            <p className="text-gray-400 text-sm">متجر الأزياء الفاخرة الأول في الشرق الأوسط</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">الروابط</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="/" className="hover:text-white transition-colors">الرئيسية</Link></li>
                                <li><Link href="/products" className="hover:text-white transition-colors">المنتجات</Link></li>
                                <li><Link href="/about" className="hover:text-white transition-colors">عن ستورنا</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">دعم العملاء</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="/contact" className="hover:text-white transition-colors">اتصل بنا</Link></li>
                                <li><Link href="/faq" className="hover:text-white transition-colors">الأسئلة الشائعة</Link></li>
                                <li><Link href="/shipping-terms" className="hover:text-white transition-colors">شروط الشحن</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">القانونية</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="/terms" className="hover:text-white transition-colors">شروط الاستخدام</Link></li>
                                <li><Link href="/contact" className="hover:text-white transition-colors">اتصل بنا</Link></li>
                                <li><Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-gray-800">
                        <p className="text-xs">© 2025 ELIA STORE. جميع الحقوق محفوظة | بغداد، العراق 🇮🇶</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

'use client';
import React, { useEffect, useState, useRef } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Star, MousePointer2, Sparkles, TrendingUp, Package, Zap, Shield, Truck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { getImageUrl } from '@/lib/imageUtil';

export default function InteractiveHomePage() {
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

    const searchQuery = (searchParams.get('search') || '').trim();
    const isSearching = searchQuery.length > 0;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await api.get('/products');
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
            } catch (error) { console.error(error); } finally { setLoading(false); }
        };
        fetchProducts();
    }, [searchParams, isSearching, searchQuery]);

    useEffect(() => {
        if (isSearching && productsRef.current) {
            productsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [isSearching]);

    // فلترة المنتجات حسب التصنيف
    const filterByCategory = (category) => {
        setSelectedCategory(category);
        if (category === 'الكل') {
            setProducts(allProducts);
        } else {
            const filtered = allProducts.filter(p => 
                p.category && p.category.toLowerCase().includes(category.toLowerCase())
            );
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
                    {/* تأثيرات هندسية عائمة */}
                    <div className="absolute top-20 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl animate-pulse delay-700"></div>
                </div>

                {/* المحتوى الرئيسي */}
                <div className="container relative z-10 px-6 text-center space-y-10 py-20">
                    {/* شارة الإطلاق الجديد */}
                    <div className="inline-flex items-center gap-3 bg-white/25 backdrop-blur-xl px-8 py-4 rounded-full border-2 border-white/40 shadow-2xl">
                        <Sparkles size={22} className="text-yellow-400" />
                        <span className="text-base font-black tracking-widest uppercase text-white">مجموعة {currentSeason} {currentYear} {currentSeason === 'صيف' ? '🔥' : currentSeason === 'شتاء' ? '❄️' : currentSeason === 'خريف' ? '🍂' : '🌸'} وصلت حديثاً</span>
                    </div>

                    {/* العنوان الرئيسي المميز */}
                    <div className="space-y-4">
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black leading-none tracking-tighter text-white drop-shadow-2xl">
                            <span className="block">أناقة</span>
                            <span className="block bg-gradient-to-r from-yellow-200 via-blue-200 to-white bg-clip-text text-transparent animate-gradient">
                                لا تُنسى
                            </span>
                        </h1>
                        <div className="h-1 w-32 bg-gradient-to-r from-blue-400 to-cyan-400 mx-auto rounded-full"></div>
                    </div>

                    {/* الوصف التوضيحي */}
                    <p className="max-w-2xl mx-auto text-2xl md:text-3xl text-white/90 font-bold leading-relaxed">
                        اكتشف عالماً من الموضة العصرية 
                        <span className="text-cyan-300"> المصممة خصيصاً </span>
                        للشخصيات المميزة في العراق
                    </p>

                    {/* أزرار الإجراءات */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8 relative z-20">
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                setSelectedCategory('الكل');
                                setProducts(allProducts);
                                setTimeout(() => {
                                    const productsSection = document.getElementById('products-section');
                                    if (productsSection) {
                                        const headerOffset = 120;
                                        const elementPosition = productsSection.getBoundingClientRect().top;
                                        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                                        window.scrollTo({
                                            top: offsetPosition,
                                            behavior: 'smooth'
                                        });
                                    }
                                }, 100);
                            }}
                            className="group px-10 py-5 bg-white text-gray-900 font-black text-xl rounded-full hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:text-white transition-all duration-500 shadow-2xl flex items-center gap-3 transform hover:scale-105 cursor-pointer"
                        >
                            <ShoppingBag size={24} className="group-hover:rotate-12 transition-transform" />
                            تسوق الآن
                            <ArrowLeft className="group-hover:-translate-x-3 transition-transform" />
                        </button>
                        <button 
                            type="button"
                            onClick={() => {
                                const featuresSection = document.getElementById('features-section');
                                if (featuresSection) {
                                    featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }
                            }}
                            className="px-10 py-5 bg-white/20 backdrop-blur-lg text-white font-bold text-xl rounded-full border-2 border-white/40 hover:bg-white hover:text-gray-900 transition-all duration-500 shadow-xl cursor-pointer"
                        >
                            اكتشف المزايا
                        </button>
                    </div>
                </div>

                {/* مؤشر التمرير */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 text-white/70">
                    <span className="text-xs font-bold uppercase tracking-widest">اكتشف المزيد</span>
                    <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
                        <div className="w-1.5 h-3 bg-white rounded-full animate-bounce"></div>
                    </div>
                </div>
            </header>
            )}

            {/* 2. الأقسام العائمة المحسّنة بتصميم Glassmorphism */}
            {!isSearching && (
            <section className="py-32 container mx-auto px-6 -mt-32 relative z-20">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4">
                        تسوق حسب <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">الفئة</span>
                    </h2>
                    <p className="text-xl text-gray-600">اختر ما يناسب أسلوبك الفريد</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { name: 'رجالي', image: 'photo-1617127365659-c47fa864d8bc', gradient: 'from-blue-600 to-cyan-600' },
                        { name: 'نسائي', image: 'photo-1483985988355-763728e1935b', gradient: 'from-pink-600 to-rose-600' },
                        { name: 'أطفال', image: 'photo-1503944583220-79d8926ad5e2', gradient: 'from-yellow-600 to-orange-600' },
                        { name: 'إكسسوارات', image: 'photo-1523779105320-d1cd346ff52b', gradient: 'from-teal-600 to-cyan-600' }
                    ].map((cat, i) => (
                        <button 
                            key={i} 
                            onClick={() => {
                                filterByCategory(cat.name);
                                scrollToProducts();
                            }}
                            className="group relative h-96 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 hover:scale-105"
                            style={{ willChange: 'transform' }}
                        >
                            {/* الصورة */}
                            <img 
                                src={`https://images.unsplash.com/${cat.image}?q=60&w=400`} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                alt={cat.name}
                                loading="lazy"
                                style={{ willChange: 'transform' }}
                            />
                            
                            {/* التدرج اللوني */}
                            <div className={`absolute inset-0 bg-gradient-to-t ${cat.gradient} opacity-60 group-hover:opacity-75 transition-opacity duration-500`}></div>
                            
                            {/* المحتوى */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
                                <h3 className="text-4xl font-black mb-4 transform group-hover:scale-110 transition-transform duration-500">
                                    {cat.name}
                                </h3>
                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 group-hover:bg-white group-hover:text-gray-900 transition-all duration-500">
                                    <span className="font-bold">استكشف الآن</span>
                                    <ArrowLeft size={18} className="group-hover:-translate-x-2 transition-transform" />
                                </div>
                            </div>

                            {/* تأثير الحواف المتوهجة */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"></div>
                            </div>
                        </button>
                    ))}
                </div>
            </section>
            )}

            {/* 3. شبكة المنتجات التفاعلية المحسّنة */}
            <section id="products-section" ref={productsRef} className="py-24 container mx-auto px-6">
                {/* عنوان القسم مع تأثير بصري متميز */}
                <div className="text-center mb-16 relative">
                    {!isSearching ? (
                        <>
                            <div className="inline-flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-full mb-6">
                                <TrendingUp size={24} className="text-blue-600" />
                                <span className="text-blue-600 font-bold text-sm uppercase tracking-wider">الأكثر مبيعاً</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black text-gray-900 mb-4 leading-tight">
                                القطع الأكثر طلباً <span className="text-blue-600">في العراق</span>
                            </h2>
                            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                                اكتشف أحدث صيحات الموضة التي يختارها آلاف العملاء
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 px-8 py-3 rounded-full mb-6 shadow-lg border border-indigo-100">
                                <TrendingUp size={24} className="text-indigo-600" />
                                <span className="text-indigo-600 font-bold text-sm uppercase tracking-wider">نتائج البحث</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 leading-tight">
                                نتائج البحث عن <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{searchQuery}</span>
                            </h2>
                            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
                                وجدنا <span className="font-black text-indigo-600">{products.length}</span> منتج مطابق لبحثك
                            </p>
                            <Link href="/" className="group inline-flex items-center gap-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-purple-300 hover:scale-110 transition-all duration-500 transform">
                                <ArrowLeft size={22} className="rotate-180 group-hover:-translate-x-2 transition-transform duration-300" />
                                <span className="group-hover:tracking-wider transition-all duration-300">العودة للرئيسية</span>
                                <div className="absolute inset-0 bg-white/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                            </Link>
                        </>
                    )}
                </div>

                {/* أزرار الفلترة المحسّنة */}
                {!isSearching && (
                    <div className="flex flex-wrap gap-3 mb-16 justify-center">
                        {['الكل', 'رجالي', 'نسائي', 'أطفال', 'إكسسوارات', 'أحذية'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => filterByCategory(cat)}
                                className={`px-6 py-3 rounded-full font-bold text-base transition-all duration-300 transform hover:scale-105 ${
                                    selectedCategory === cat
                                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-200'
                                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}

                {/* عرض المنتجات إذا كانت موجودة */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {products.map((p) => (
                            <Link href={`/product/${p._id || p.id}`} key={p._id || p.id} className="group">
                                <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2" style={{ willChange: 'transform, box-shadow' }}>
                                    {/* صورة المنتج */}
                                    <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                                        <img 
                                            src={getImageUrl(p.image)} 
                                            alt={p.name}
                                            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                                            loading="lazy"
                                            style={{ willChange: 'transform' }}
                                            onError={(e) => { e.target.src = '/placeholder.svg'; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                                        
                                        {/* زر الإضافة للسلة */}
                                        <div className="absolute bottom-4 left-4 right-4 translate-y-16 group-hover:translate-y-0 transition-all duration-500 opacity-0 group-hover:opacity-100">
                                            <button className="w-full bg-white text-gray-900 py-3 rounded-2xl font-bold shadow-xl flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-colors">
                                                <ShoppingBag size={18}/> أضف للسلة
                                            </button>
                                        </div>

                                        {/* شارة التصنيف */}
                                        <div className="absolute top-4 right-4">
                                            <span className="bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                                                {p.category}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* معلومات المنتج */}
                                    <div className="p-5">
                                        <h3 className="text-xl font-black text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {p.name}
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <div className="text-2xl font-black text-blue-600">
                                                {Number(p.price).toLocaleString()}
                                                <span className="text-sm font-medium text-gray-600 mr-1">د.ع</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-yellow-500">
                                                <Star size={16} fill="currentColor" />
                                                <span className="text-sm font-bold text-gray-700">4.8</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    /* رسالة عند عدم وجود منتجات */
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                            <Package size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{isSearching ? 'لا توجد نتائج مطابقة' : 'لا توجد منتجات'}</h3>
                        <p className="text-gray-500">{isSearching ? 'جرّب كلمة بحث أخرى أو تأكد من التهجئة' : 'لم نجد منتجات في هذا القسم حالياً'}</p>
                    </div>
                )}
            </section>

            {/* 4. قسم المزايا المحسّن بتصميم عصري */}
            {!isSearching && (
            <section id="features-section" className="py-32 bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
                {/* خلفية مزخرفة */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    {/* العنوان */}
                    <div className="text-center mb-20">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full mb-6">
                            <Zap size={20} className="text-yellow-400" />
                            <span className="font-bold text-sm uppercase tracking-wider">لماذا ELIA؟</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
                            تجربة تسوق <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">استثنائية</span>
                        </h2>
                        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                            نقدم لك أفضل تجربة تسوق أونلاين في العراق مع ميزات حصرية وخدمة عملاء متميزة
                        </p>
                    </div>

                    {/* المزايا */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {[
                            {
                                icon: <Shield size={40} />,
                                title: 'الدفع عند الاستلام',
                                desc: 'استلم منتجك وتأكد من جودته قبل الدفع. ثقتك هي أولويتنا',
                                color: 'from-green-400 to-emerald-600'
                            },
                            {
                                icon: <Truck size={40} />,
                                title: 'توصيل سريع ومجاني',
                                desc: 'توصيل إلى جميع محافظات العراق خلال 2-5 أيام عمل',
                                color: 'from-blue-400 to-cyan-600'
                            },
                            {
                                icon: <Star size={40} />,
                                title: 'جودة عالية مضمونة',
                                desc: 'منتجات أصلية 100% مع ضمان الاستبدال والاسترجاع',
                                color: 'from-yellow-400 to-orange-600'
                            }
                        ].map((feature, idx) => (
                            <div 
                                key={idx}
                                className="group relative bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 hover:border-white/30 transition-all duration-500 hover:-translate-y-2"
                                style={{ willChange: 'transform' }}
                            >
                                {/* أيقونة مع تدرج لوني */}
                                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                    {feature.icon}
                                </div>
                                
                                <h3 className="text-2xl font-black mb-4">{feature.title}</h3>
                                <p className="text-gray-300 leading-relaxed">{feature.desc}</p>

                                {/* خط زخرفي */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                            </div>
                        ))}
                    </div>

                    {/* إحصائيات إضافية */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 bg-white/5 backdrop-blur-lg rounded-3xl p-12 border border-white/10">
                        {[
                            { number: '98%', label: 'رضا العملاء' },
                            { number: '24/7', label: 'دعم فني' },
                            { number: '2-5', label: 'أيام توصيل' },
                            { number: '100%', label: 'أصلي ومضمون' }
                        ].map((stat, idx) => (
                            <div key={idx} className="text-center">
                                <div className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                                    {stat.number}
                                </div>
                                <div className="text-gray-400 font-bold">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            )}

            {/* 5. Footer محسّن */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="container mx-auto px-6 text-center space-y-4">
                    <div className="text-3xl font-black text-white mb-4">ELIA STORE</div>
                    <p className="text-sm">متجر الموضة الأول في العراق</p>
                    <div className="flex items-center justify-center gap-6 text-sm">
                        <Link href="/about" className="hover:text-white transition-colors">من نحن</Link>
                        <span>•</span>
                        <Link href="/contact" className="hover:text-white transition-colors">اتصل بنا</Link>
                        <span>•</span>
                        <Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
                    </div>
                    <div className="pt-6 border-t border-gray-800">
                        <p className="text-xs">© 2025 ELIA STORE. جميع الحقوق محفوظة | بغداد، العراق 🇮🇶</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
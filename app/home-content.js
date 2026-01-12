'use client';
import React, { useEffect, useState, useRef } from 'react';
import api from '@/lib/axios';
import Link from 'next/link';
import { ShoppingBag, ArrowLeft, Star, MousePointer2, Sparkles, TrendingUp, Package, Zap, Shield, Truck } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { getImageUrl } from '@/lib/imageUtil';

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
                </div>

                {/* محتوى Hero */}
                <div className="relative z-10 text-center px-4 max-w-2xl">
                    <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full mb-6">
                        <span className="text-white text-sm font-semibold">{currentSeason} {currentYear} 🌟</span>
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                        تسوق الأزياء الفاخرة
                    </h1>
                    
                    <p className="text-xl text-white/90 mb-8 font-light">
                        اكتشف أحدث المجموعات من ماركات عالمية حصرية وتمتع بتجربة تسوق لا تُنسى
                    </p>
                    
                    <button 
                        onClick={scrollToProducts}
                        className="inline-flex items-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform duration-300 shadow-2xl"
                    >
                        <ShoppingBag size={20} />
                        اكتشف المنتجات
                    </button>
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
                            <h2 className="text-4xl font-black mb-12 text-center">المنتجات المتاحة</h2>
                            
                            {/* فلاتر التصنيفات */}
                            <div className="flex flex-wrap gap-3 justify-center mb-12">
                                {['الكل', 'نساء', 'رجال', 'أطفال', 'إكسسوارات'].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => filterByCategory(cat)}
                                        className={`px-6 py-3 rounded-full font-semibold transition-all ${
                                            selectedCategory === cat 
                                            ? 'bg-indigo-600 text-white shadow-lg' 
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
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
                            {products.map(product => (
                                <Link key={product.id} href={`/product/${product.id}`}>
                                    <div className="group cursor-pointer">
                                        <div className="relative overflow-hidden rounded-lg bg-gray-200 h-64 mb-4">
                                            <img 
                                                src={getImageUrl(product.image)} 
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                            />
                                            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                                {product.discount}%
                                            </div>
                                        </div>
                                        <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2">
                                                <span className="font-bold text-indigo-600">${product.price}</span>
                                                {product.originalPrice && (
                                                    <span className="line-through text-gray-400">${product.originalPrice}</span>
                                                )}
                                            </div>
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={16} fill={i < product.rating ? '#fbbf24' : '#e5e7eb'} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-black text-center mb-12">لماذا تختار إيليا؟</h2>
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
                                <li><Link href="/shipping" className="hover:text-white transition-colors">شروط الشحن</Link></li>
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

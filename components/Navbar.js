'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/app/context/CartContext';
import { ShoppingBag, User, Menu, X, Search, Zap, Star } from 'lucide-react';

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { cartItems } = useCart();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // تغيير شكل النافبار عند التمرير
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const isAuthPage = pathname === '/login' || pathname === '/register';

    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
            isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm py-4' : 'bg-transparent py-6'
        }`} dir="rtl">
            <div className="container mx-auto px-6 flex justify-between items-center">
                
                {/* الشعار */}
                <Link href="/" className="text-3xl font-black tracking-tighter text-gray-900 group">
                    ELIA<span className="text-indigo-600 group-hover:text-black transition-colors">.</span>
                </Link>

                {/* روابط الكمبيوتر */}
                <div className="hidden md:flex items-center gap-10 font-bold text-sm uppercase tracking-widest text-gray-600">
                    <Link href="/" className="hover:text-indigo-600 transition-colors">الرئيسية</Link>
                    <Link href="/shop/men" className="hover:text-indigo-600 transition-colors">رجالي</Link>
                    <Link href="/shop/women" className="hover:text-indigo-600 transition-colors">نسائي</Link>
                    <Link href="/about" className="hover:text-indigo-600 transition-colors">قصتنا</Link>
                </div>

                {/* أيقونات التحكم */}
                <div className="flex items-center gap-6">
                    <button className="hidden sm:block text-gray-600 hover:text-indigo-600 transition-colors">
                        <Search size={22} />
                    </button>
                    <Link href="/login" className="text-gray-600 hover:text-indigo-600 transition-colors">
                        <User size={22} />
                    </Link>
                    <Link href="/cart" className="relative group p-2">
                        <ShoppingBag size={24} className="text-gray-900 group-hover:text-indigo-600 transition-colors" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                    <button className="md:hidden text-gray-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>
            {/* الراية الترويجية تحت الـ navbar */}
            {!isScrolled && !isAuthPage && (
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-6 mt-4 text-center animate-in fade-in duration-500">
                    <h2 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
                        اكتشف أحدث المجموعات
                    </h2>
                    <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                        <button 
                            onClick={() => router.push('/#products-section')}
                            className="flex items-center gap-2 bg-white text-indigo-600 px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                        >
                            <ShoppingBag size={20} />
                            تسوق الآن
                        </button>
                        <button 
                            onClick={() => router.push('/#features')}
                            className="flex items-center gap-2 bg-white/20 text-white px-8 py-3 rounded-full font-bold hover:bg-white/30 transition-all border border-white/40"
                        >
                            <Star size={20} />
                            اكتشف المزايا
                        </button>
                    </div>
                </div>
            )}
            {/* قائمة الموبايل */}
            {isMenuOpen && (
                <div className="md:hidden bg-white h-screen w-full absolute top-0 right-0 z-[-1] flex flex-col items-center justify-center gap-8 text-2xl font-black animate-in slide-in-from-top duration-500">
                    <Link href="/" onClick={() => setIsMenuOpen(false)}>الرئيسية</Link>
                    <Link href="/shop/men" onClick={() => setIsMenuOpen(false)}>رجالي</Link>
                    <Link href="/shop/women" onClick={() => setIsMenuOpen(false)}>نسائي</Link>
                    <Link href="/cart" onClick={() => setIsMenuOpen(false)}>السلة ({cartCount})</Link>
                </div>
            )}
          /*  {/* لا تظهر البروفايل إذا كنا في صفحة تسجيل الدخول أو التسجيل */}*/
        {!isAuthPage && userInfo && (
            <div className="profile-section">
                <img src={userInfo.avatar} alt={userInfo.name} />
                <span>{userInfo.name}</span>
            </div>
        )}
        </nav>
    );
}
'use client';

import Link from 'next/link';
import { Facebook, Instagram, Twitter, Mail, Phone } from 'lucide-react';

export default function Footer() {
    // جلب السنة الحالية تلقائياً
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8 font-sans" dir="rtl">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    
                    {/* عمود الهوية */}
                    <div className="space-y-6">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tighter">إيليا</h2>
                        <p className="text-gray-500 text-sm leading-relaxed font-bold">
                            وجهتكم الأولى للأزياء العصرية في العراق. نجمع بين الأناقة والجودة لنقدم لكم تجربة تسوق فريدة.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-indigo-600 hover:text-white transition-all">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-blue-400 hover:text-white transition-all">
                                <Twitter size={20} />
                            </a>
                        </div>
                    </div>

                    {/* روابط سريعة */}
                    <div>
                        <h4 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-xs">المتجر</h4>
                        <ul className="space-y-4 text-sm font-bold text-gray-500">
                            <li><Link href="/about" className="hover:text-indigo-600 transition-colors">من نحن</Link></li>
                            <li><Link href="/products" className="hover:text-indigo-600 transition-colors">جميع المنتجات</Link></li>
                            <li><Link href="/categories" className="hover:text-indigo-600 transition-colors">التصنيفات</Link></li>
                        </ul>
                    </div>

                    {/* الدعم القانوني */}
                    <div>
                        <h4 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-xs">المساعدة والقانون</h4>
                        <ul className="space-y-4 text-sm font-bold text-gray-500">
                            <li><Link href="/terms" className="hover:text-indigo-600 transition-colors">شروط الاستخدام</Link></li>
                            <li><Link href="/returns" className="hover:text-indigo-600 transition-colors">سياسة الاستبدال</Link></li>
                            <li><Link href="/shipping-info" className="hover:text-indigo-600 transition-colors">معلومات التوصيل</Link></li>
                        </ul>
                    </div>

                    {/* التواصل */}
                    <div>
                        <h4 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-xs">تواصل معنا</h4>
                        <ul className="space-y-4 text-sm font-bold text-gray-500">
                            <li className="flex items-center gap-3"><Phone size={16} className="text-indigo-600"/> 0770 000 0000</li>
                            <li className="flex items-center gap-3"><Mail size={16} className="text-indigo-600"/> info@elia-store.com</li>
                            <li className="mt-4 text-[10px] text-indigo-400 font-black uppercase tracking-widest">بغداد - المنصور</li>
                        </ul>
                    </div>
                </div>

                {/* الحقوق - هنا تتغير السنة تلقائياً */}
                <div className="border-t border-gray-50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[11px] text-gray-400 font-black uppercase tracking-[0.2em]">
                        © {currentYear} ELIA E-COMMERCE | ALL RIGHTS RESERVED
                    </p>
                    <div className="flex items-center gap-6">
                        <img src="/payment-methods.png" alt="ZainCash, Visa, Master" className="h-5 opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer" />
                    </div>
                </div>
            </div>
        </footer>
    );
}
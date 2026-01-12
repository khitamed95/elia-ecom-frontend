'use client';
import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/axios';
import { Search, X, Loader2, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ModernSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const searchRef = useRef(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL; 

    // كلمات البحث الرائجة (يمكنك جلبها من السيرفر لاحقاً)
    const trendingTags = ['جاكيت جلد', 'فستان سهرة', 'أحذية رياضية', 'قميص صيفي'];

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (query.length > 1) {
                setLoading(true);
                try {
                    const { data } = await api.get(`/products?keyword=${query}`);
                    setResults(data);
                } catch (err) { console.error(err); }
                setLoading(false);
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    // إغلاق القائمة عند الضغط خارج المكون
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full max-w-xl mx-auto z-[100]" dir="rtl" ref={searchRef}>
            {/* مربع البحث الحديث */}
            <div className={`relative group transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
                <input
                    type="text"
                    onFocus={() => setIsFocused(true)}
                    placeholder="ابحث عن أناقتك القادمة..."
                    className="w-full p-5 pr-14 bg-white/80 backdrop-blur-md rounded-[2rem] border-2 border-transparent focus:border-indigo-500 focus:bg-white shadow-lg transition-all outline-none font-bold text-gray-800"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <Search className={`absolute right-5 top-5 transition-colors ${isFocused ? 'text-indigo-600' : 'text-gray-400'}`} size={24} />
                {query && (
                    <button onClick={() => setQuery('')} className="absolute left-14 top-5 text-gray-400 hover:text-red-500">
                        <X size={20} />
                    </button>
                )}
                {loading && <Loader2 className="absolute left-5 top-5 animate-spin text-indigo-600" size={24} />}
            </div>

            {/* بوكس النتائج والكلمات الرائجة */}
            {isFocused && (
                <div className="absolute top-full mt-4 w-full bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    
                    {/* الكلمات الرائجة - تظهر فقط عندما يكون الحقل فارغاً */}
                    {query.length <= 1 && (
                        <div className="p-8">
                            <div className="flex items-center gap-2 text-indigo-600 font-black mb-6">
                                <TrendingUp size={20} />
                                <span>عمليات البحث الرائجة</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {trendingTags.map((tag, i) => (
                                    <button 
                                        key={i} 
                                        onClick={() => setQuery(tag)}
                                        className="px-6 py-3 bg-gray-50 hover:bg-indigo-600 hover:text-white rounded-2xl text-sm font-bold text-gray-600 transition-all flex items-center gap-2"
                                    >
                                        <Search size={14} /> {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* نتائج البحث مع الصور المصغرة */}
                    {results.length > 0 && (
                        <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                            <div className="p-4 bg-gray-50/50 text-xs font-black text-gray-400 border-b border-gray-100 uppercase tracking-widest px-8">
                                هل تقصد أحد هذه المنتجات؟
                            </div>
                            {results.map((product) => (
                                <Link 
                                    href={`/product/${product.id}`} 
                                    key={product.id}
                                    onClick={() => setIsFocused(false)}
                                    className="flex items-center gap-6 p-6 hover:bg-indigo-50/80 transition-all border-b border-gray-50 last:border-0 group"
                                >
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 shadow-sm group-hover:scale-105 transition-transform">
                                        <img 
                                            src={`${API_URL}${product.thumbnail || product.image}`} 
                                            className="w-full h-full object-cover"
                                            alt={product.name}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-black text-xl text-gray-900 leading-tight">{product.name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-indigo-600 font-black text-lg">{product.price.toLocaleString()} د.ع</span>
                                            <span className="text-[10px] bg-gray-100 px-2 py-1 rounded-md font-bold text-gray-400 uppercase">{product.category}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Loader2, ShoppingBag, Ruler, Heart, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ProductDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState('');

    const getImageUrl = (path) => {
        if (!path) return '/placeholder.png';
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${process.env.NEXT_PUBLIC_API_URL}${cleanPath}`;
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await api.get(`/products/${id}`);
                setProduct(data);
                setLoading(false);
            } catch (err) {
                toast.error('فشل في تحميل بيانات المنتج');
                router.push('/');
            }
        };
        if (id) fetchProduct();
    }, [id, router]);

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-indigo-600" size={50} /></div>
    );

    if (!product) return <div className="text-center p-20 font-bold">المنتج غير موجود</div>;

    return (
        <div className="min-h-screen bg-white p-6 md:p-12 font-sans" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <button onClick={() => router.back()} className="mb-10 flex items-center gap-2 text-gray-500 font-bold hover:text-black">
                    <ArrowRight size={20} /> العودة للمتجر
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    <div className="rounded-[3rem] overflow-hidden bg-gray-50 border border-gray-100">
                        <img 
                            src={getImageUrl(product.image)} 
                            alt={product.name}
                            loading="eager"
                            className="w-full h-auto object-cover aspect-[3/4]"
                            onError={e => e.target.src = '/placeholder.png'}
                        />
                    </div>

                    <div className="flex flex-col justify-center">
                        <h1 className="text-5xl font-black text-gray-900 mb-6">{product.name}</h1>
                        <div className="flex items-center gap-6 mb-8">
                            <span className="text-4xl font-black text-indigo-600">{Number(product.price).toLocaleString()} د.ع</span>
                        </div>
                        <p className="text-xl text-gray-500 leading-relaxed mb-10">{product.description}</p>

                        <div className="mb-10">
                            <h3 className="text-xl font-black mb-6">المقاسات المتوفرة</h3>
                            <div className="flex flex-wrap gap-3">
                                {product.availableSizes?.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`min-w-[80px] py-4 rounded-2xl font-black transition-all border-2 ${
                                            selectedSize === size ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl' : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-500'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            disabled={!selectedSize && product.availableSizes?.length > 0}
                            className="w-full bg-black text-white py-6 rounded-3xl font-black text-xl flex items-center justify-center gap-4 hover:bg-indigo-600 transition-all disabled:opacity-30"
                        >
                            <ShoppingBag size={24} /> إضافة إلى السلة
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
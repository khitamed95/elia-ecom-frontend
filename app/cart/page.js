'use client';
import { useCart } from '@/context/CartContext';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, MapPin, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CartPage() {
    const router = useRouter();
    const { cartItems, addToCart, removeFromCart } = useCart();
    const [userInfo, setUserInfo] = useState(null);
    const [city, setCity] = useState('بغداد');
    const [deliveryPrice, setDeliveryPrice] = useState(5000);

    useEffect(() => {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) setUserInfo(JSON.parse(storedUserInfo));
    }, []);

    useEffect(() => {
        setDeliveryPrice(city === 'بغداد' ? 5000 : 8000);
    }, [city]);

    const itemsPrice = cartItems?.reduce((acc, item) => acc + item.price * item.qty, 0) || 0;
    const totalPrice = itemsPrice + deliveryPrice;

    const checkoutHandler = () => {
        if (!userInfo) {
            toast.info('يرجى تسجيل الدخول أولاً');
            router.push('/login?redirect=shipping');
        } else {
            router.push('/shipping');
        }
    };

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6" dir="rtl">
                <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-lg">
                    <ShoppingBag size={80} className="mx-auto mb-6 text-indigo-100" />
                    <h2 className="text-3xl font-black mb-4">سلتك فارغة</h2>
                    <Link href="/">
                        <button className="bg-black text-white px-10 py-4 rounded-2xl font-black">ابدأ التسوق</button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6 lg:p-12" dir="rtl">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-6 md:mb-10 flex items-center gap-3 md:gap-4">
                    <ShoppingBag className="text-indigo-600" size={32} /> حقيبة المشتريات
                </h1>

                <div className="grid lg:grid-cols-3 gap-6 md:gap-10">
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">
                        {cartItems.map((item) => (
                            <div key={item.cartKey} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
                                <div className="w-20 h-24 sm:w-24 sm:h-32 rounded-xl md:rounded-2xl overflow-hidden shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base md:text-lg font-black truncate">{item.name}</h3>
                                    <p className="text-xs md:text-sm text-gray-400 font-bold">المقاس: {item.size} | اللون: {item.color}</p>
                                    <div className="text-lg md:text-xl font-black mt-2">{item.price.toLocaleString()} د.ع</div>
                                </div>
                                <div className="flex items-center gap-3 md:gap-4 bg-gray-50 p-2 rounded-xl md:rounded-2xl w-full sm:w-auto justify-between sm:justify-start">
                                    <button onClick={() => addToCart(item, -1, item.size, item.color)} disabled={item.qty === 1} className="p-2"><Minus size={16} /></button>
                                    <span className="font-black text-lg">{item.qty}</span>
                                    <button onClick={() => addToCart(item, 1, item.size, item.color)} className="p-2"><Plus size={16} /></button>
                                    <button onClick={() => removeFromCart(item.cartKey)} className="text-red-400 hover:text-red-600 sm:hidden"><Trash2 size={20} /></button>
                                </div>
                                <button onClick={() => removeFromCart(item.cartKey)} className="text-red-400 hover:text-red-600 hidden sm:block"><Trash2 size={24} /></button>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-[3rem] shadow-xl h-fit sticky top-10">
                        <h3 className="text-lg md:text-xl font-black mb-6 md:mb-8 border-b pb-4">ملخص الطلب</h3>
                        <div className="mb-6 space-y-2">
                            <label className="text-xs font-black text-gray-400">اختر المحافظة للتوصيل</label>
                            <select className="w-full p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl font-bold text-sm md:text-base" value={city} onChange={(e) => setCity(e.target.value)}>
                                <option value="بغداد">داخل بغداد</option>
                                <option value="محافظة">كافة المحافظات الأخرى</option>
                            </select>
                        </div>
                        <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                            <div className="flex justify-between font-bold text-sm md:text-base text-gray-500">
                                <span>مجموع القطع</span>
                                <span>{itemsPrice.toLocaleString()} د.ع</span>
                            </div>
                            <div className="flex justify-between font-bold text-sm md:text-base text-gray-500">
                                <span>التوصيل</span>
                                <span>{deliveryPrice.toLocaleString()} د.ع</span>
                            </div>
                            <div className="flex justify-between pt-4 md:pt-6 border-t text-xl md:text-2xl font-black">
                                <span>الإجمالي</span>
                                <span className="text-green-600">{totalPrice.toLocaleString()} د.ع</span>
                            </div>
                        </div>
                        <button onClick={checkoutHandler} className="w-full bg-indigo-600 text-white py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-lg md:text-xl">إتمام الشراء</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
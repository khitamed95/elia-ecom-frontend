'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // أضفنا هذا الاستيراد
import { useCart } from '@/context/CartContext';
import api from '@/lib/axios';
import { CreditCard, Wallet, CheckCircle, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';

export default function PaymentPage() {
    const router = useRouter();
    const { cartItems, clearCart } = useCart();
    const [userInfo, setUserInfo] = useState(null);
    const [shippingAddress, setShippingAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cod'); 
    const [loading, setLoading] = useState(false);
    
    // --- ميزة الموافقة على الشروط ---
    const [agreed, setAgreed] = useState(false);

    const itemsPrice = cartItems?.reduce((acc, item) => acc + item.price * item.qty, 0) || 0;
    const deliveryPrice = shippingAddress?.city === 'بغداد' ? 5000 : 8000;
    const totalPrice = itemsPrice + deliveryPrice;

    useEffect(() => {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (!storedUserInfo) {
            toast.error('يرجى تسجيل الدخول أولاً');
            router.push('/login?redirect=payment');
            return;
        }
        setUserInfo(JSON.parse(storedUserInfo));

        const savedAddress = localStorage.getItem('shippingAddress');
        if (!savedAddress) {
            toast.error('يرجى إدخال عنوان الشحن أولاً');
            router.push('/shipping');
            return;
        }
        setShippingAddress(JSON.parse(savedAddress));
    }, [router]);

    // دالة تصفير السلة والبيانات المؤقتة
    const clearStorage = () => {
        clearCart(); // تصفير الـ Context
        localStorage.removeItem('elia_cart'); 
        localStorage.removeItem('cartItems'); 
        localStorage.removeItem('shippingAddress');
    };

    const placeOrderHandler = async () => {
        if (!agreed) {
            toast.warning("يرجى الموافقة على شروط الاستخدام أولاً");
            return;
        }

        setLoading(true);
        try {
            // 1. تنظيف وتنسيق رقم الهاتف ليتوافق مع الباك إند
            let cleanPhone = shippingAddress.phone ? String(shippingAddress.phone).replace(/\D/g, '') : '';
            if (cleanPhone.startsWith('964')) {
                cleanPhone = '0' + cleanPhone.substring(3);
            } else if (!cleanPhone.startsWith('0') && cleanPhone.length === 10) {
                cleanPhone = '0' + cleanPhone;
            }

            // 2. تجهيز بيانات الطلب (Payload)
            const orderData = {
                orderItems: cartItems.map(item => ({
                    productId: item.productId || item.id,
                    name: item.name,
                    qty: Number(item.qty),
                    price: Number(item.price),
                    image: item.image,
                    size: item.size || 'N/A',
                    color: item.color || 'N/A'
                })),
                shippingAddress: {
                    address: `${shippingAddress.area}, ${shippingAddress.street}`,
                    city: shippingAddress.city,
                    country: 'Iraq'
                },
                paymentMethod: paymentMethod === 'cod' ? 'الدفع عند الاستلام' : 'بطاقة ائتمان',
                itemsPrice: Number(itemsPrice),
                shippingPrice: Number(deliveryPrice),
                totalPrice: Number(totalPrice),
                phone: cleanPhone, // إرسال الهاتف في المستوى الأول
                userId: userInfo.id
            };

            if (paymentMethod === 'card') {
                const { data: order } = await api.post('/orders', orderData);
                try {
                    const { data: session } = await api.post('/payment/create-session', { orderId: order.id });
                    window.location.href = session.url;
                } catch (pError) {
                    toast.warning(`تم تسجيل الطلب #${order.id}، ولكن بوابة الدفع غير مفعلة حالياً.`);
                    clearStorage();
                    router.push(`/order-success/${order.id}`);
                }
            } else {
                const { data } = await api.post('/orders', orderData);
                toast.success('تم إرسال طلبك بنجاح! 🎉');
                
                // 3. التصفير النهائي لمنع بقاء أي عنصر
                clearStorage();
                
                setTimeout(() => {
                    router.push(`/order-success/${data.id}`);
                }, 1000);
            }
        } catch (error) {
            const msg = error.response?.data?.message || 'فشل في إرسال الطلب';
            toast.error(`خطأ: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    if (!shippingAddress || !userInfo) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={50} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6" dir="rtl">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 font-bold transition-all">
                    <ArrowRight size={20} /> العودة لعنوان الشحن
                </button>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-gray-100">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="bg-green-600 p-4 rounded-2xl text-white shadow-lg">
                                    <CreditCard size={32} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black text-gray-800">طريقة الدفع</h1>
                                    <p className="text-gray-500 font-medium mt-1">اختر الطريقة المناسبة لك</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div onClick={() => setPaymentMethod('cod')} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'cod' ? 'border-indigo-600' : 'border-gray-300'}`}>
                                                {paymentMethod === 'cod' && <div className="w-3 h-3 rounded-full bg-indigo-600"></div>}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-gray-800 text-lg">الدفع عند الاستلام</h3>
                                                <p className="text-sm text-gray-500 font-medium mt-1">ادفع نقداً عند استلام الطلب</p>
                                            </div>
                                        </div>
                                        <Wallet className="text-green-600" size={32} />
                                    </div>
                                </div>

                                <div onClick={() => setPaymentMethod('card')} className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-indigo-600' : 'border-gray-300'}`}>
                                                {paymentMethod === 'card' && <div className="w-3 h-3 rounded-full bg-indigo-600"></div>}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-gray-800 text-lg">الدفع الإلكتروني</h3>
                                                <p className="text-sm text-gray-500 font-medium mt-1">بطاقة ائتمان أو محفظة إلكترونية</p>
                                            </div>
                                        </div>
                                        <CreditCard className="text-indigo-600" size={32} />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4">
                                <ShieldCheck className="text-blue-600 shrink-0" />
                                <p className="text-sm font-bold text-blue-800">✅ <strong>ضمان الأمان:</strong> جميع معلوماتك محمية بالكامل. يمكنك فحص المنتجات قبل الدفع.</p>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[3rem] p-8 shadow-xl border border-gray-100 sticky top-8">
                            <h3 className="text-xl font-black text-gray-800 mb-6 border-b border-gray-50 pb-4">ملخص الطلب</h3>
                            <div className="space-y-4 mb-6">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3">
                                        <div className="w-16 h-20 rounded-xl overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-gray-800">{item.name}</p>
                                            <p className="text-xs text-gray-500">الكمية: {item.qty}</p>
                                        </div>
                                        <p className="font-black text-gray-800 text-sm">{(item.price * item.qty).toLocaleString()} د.ع</p>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3 mb-6 pb-6 border-b border-gray-50">
                                <div className="flex justify-between text-gray-600 font-bold text-sm">
                                    <span>مجموع المنتجات</span>
                                    <span>{itemsPrice.toLocaleString()} د.ع</span>
                                </div>
                                <div className="flex justify-between text-gray-600 font-bold text-sm">
                                    <span>التوصيل</span>
                                    <span>{deliveryPrice.toLocaleString()} د.ع</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-2xl font-black text-gray-900 mb-6">
                                <span>الإجمالي</span>
                                <span className="text-green-600">{totalPrice.toLocaleString()} د.ع</span>
                            </div>

                            <div className="mb-6 p-4 bg-gray-50 rounded-2xl text-xs font-bold text-gray-800">
                                <p className="text-gray-400 mb-1">توصيل إلى:</p>
                                {shippingAddress.fullName}<br/>
                                {shippingAddress.city} - {shippingAddress.area}
                            </div>

                            {/* صندوق الموافقة التفاعلي */}
                            <div className="flex items-start gap-3 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                <input 
                                    type="checkbox" 
                                    id="agree-terms"
                                    checked={agreed}
                                    onChange={(e) => setAgreed(e.target.checked)}
                                    className="w-5 h-5 mt-0.5 accent-indigo-600 cursor-pointer"
                                />
                                <label htmlFor="agree-terms" className="text-[10px] text-gray-600 font-bold cursor-pointer leading-relaxed">
                                    بالضغط على تأكيد الطلب، فإنني أوافق على 
                                    <Link href="/terms" className="text-indigo-600 underline mx-1">شروط الاستخدام</Link> 
                                    و <Link href="/returns" className="text-indigo-600 underline mx-1">سياسة الاستبدال</Link> لعام {new Date().getFullYear()}.
                                </label>
                            </div>

                            <button 
                                onClick={placeOrderHandler} 
                                disabled={loading || !agreed} 
                                className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3 transition-all ${
                                    (!agreed || loading) ? 'bg-gray-200 cursor-not-allowed text-gray-400' : 'bg-gradient-to-r from-green-600 to-green-500 text-white'
                                }`}
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle size={24} />} 
                                تأكيد الطلب
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {/* تذييل الصفحة الديناميكي */}
            <div className="mt-12 text-center">
                <p className="text-gray-300 font-black text-[10px] uppercase tracking-[0.2em]">
                    ELIA Secure Payment System | {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
}
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import api from '@/lib/axios';
import { 
    CreditCard, 
    Lock, 
    ArrowRight, 
    Loader2,
    CheckCircle2,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function CardPaymentPage() {
    const router = useRouter();
    const { clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [orderData, setOrderData] = useState(null);
    
    const [cardData, setCardData] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });

    useEffect(() => {
        // استرجاع بيانات الطلب من localStorage
        const savedOrder = localStorage.getItem('pendingOrder');
        if (!savedOrder) {
            toast.error('لا توجد بيانات طلب');
            router.push('/checkout');
            return;
        }
        setOrderData(JSON.parse(savedOrder));
    }, [router]);

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = (matches && matches[0]) || '';
        const parts = [];
        
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        
        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const formatExpiryDate = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (v.length >= 2) {
            return v.substring(0, 2) + '/' + v.substring(2, 4);
        }
        return v;
    };

    const handleCardNumberChange = (e) => {
        const formatted = formatCardNumber(e.target.value);
        if (formatted.replace(/\s/g, '').length <= 16) {
            setCardData({...cardData, cardNumber: formatted});
        }
    };

    const handleExpiryChange = (e) => {
        const formatted = formatExpiryDate(e.target.value);
        if (formatted.replace(/\//g, '').length <= 4) {
            setCardData({...cardData, expiryDate: formatted});
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // التحقق من البيانات
        const cardNumberClean = cardData.cardNumber.replace(/\s/g, '');
        if (cardNumberClean.length !== 16) {
            toast.error('رقم البطاقة يجب أن يكون 16 رقماً');
            return;
        }

        if (cardData.cvv.length !== 3) {
            toast.error('رمز CVV يجب أن يكون 3 أرقام');
            return;
        }

        const [month, year] = cardData.expiryDate.split('/');
        if (!month || !year || month > 12 || month < 1) {
            toast.error('تاريخ انتهاء البطاقة غير صحيح');
            return;
        }

        setLoading(true);
        
        try {
            // محاكاة معالجة الدفع (2 ثانية)
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // إرسال الطلب للباك إند
            const { data } = await api.post('/orders', orderData);
            
            // حفظ رقم الطلب
            localStorage.setItem('lastOrderId', data.id);
            localStorage.removeItem('pendingOrder');
            
            toast.success(`✅ تم الدفع بنجاح! رقم الطلب: #${data.id}`, {
                position: "top-center",
                autoClose: 5000,
            });
            
            // تفريغ السلة
            clearCart();
            
            // التوجه لصفحة النجاح
            setTimeout(() => {
                router.push(`/order-success/${data.id}`);
            }, 1500);
            
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'فشل في معالجة الدفع';
            toast.error(errorMsg);
            console.error('Payment error:', error.response?.data);
        } finally {
            setLoading(false);
        }
    };

    if (!orderData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans" dir="rtl">
            <div className="max-w-2xl mx-auto">
                {/* زر العودة */}
                <button 
                    onClick={() => {
                        localStorage.removeItem('pendingOrder');
                        router.back();
                    }} 
                    className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 mb-10 font-black transition-all group"
                >
                    <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" /> 
                    العودة للخلف
                </button>

                {/* بطاقة الدفع الرئيسية */}
                <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                    
                    {/* العنوان */}
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <CreditCard className="text-indigo-600" size={40} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-3">الدفع الإلكتروني</h2>
                        <p className="text-gray-400 font-bold text-sm">أدخل بيانات بطاقتك الائتمانية بشكل آمن</p>
                    </div>

                    {/* تحذير تجريبي */}
                    <div className="mb-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
                        <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-amber-900 font-black text-sm mb-1">وضع تجريبي</p>
                            <p className="text-amber-700 text-xs font-bold">
                                هذا نظام دفع تجريبي. لن يتم خصم أي مبلغ فعلي من حسابك.
                            </p>
                        </div>
                    </div>

                    {/* ملخص المبلغ */}
                    <div className="mb-10 p-6 bg-indigo-50 rounded-[2.5rem] border border-indigo-100">
                        <div className="flex justify-between items-center">
                            <span className="text-indigo-900 font-black text-lg">المبلغ الإجمالي</span>
                            <span className="text-indigo-600 font-black text-3xl tracking-tighter">
                                {orderData.totalPrice.toLocaleString()} د.ع
                            </span>
                        </div>
                    </div>

                    {/* نموذج البطاقة */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* رقم البطاقة */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 mr-2 flex items-center gap-2 uppercase tracking-widest">
                                <CreditCard size={14} className="text-indigo-500" /> رقم البطاقة
                            </label>
                            <input 
                                type="text" 
                                required
                                placeholder="1234 5678 9012 3456"
                                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none font-bold text-left tracking-widest text-xl"
                                value={cardData.cardNumber}
                                onChange={handleCardNumberChange}
                                dir="ltr"
                            />
                        </div>

                        {/* اسم حامل البطاقة */}
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 mr-2 uppercase tracking-widest">
                                اسم حامل البطاقة
                            </label>
                            <input 
                                type="text" 
                                required
                                placeholder="CARDHOLDER NAME"
                                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none font-bold text-left uppercase tracking-wide"
                                value={cardData.cardName}
                                onChange={(e) => setCardData({...cardData, cardName: e.target.value.toUpperCase()})}
                                dir="ltr"
                            />
                        </div>

                        {/* تاريخ الانتهاء و CVV */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 mr-2 uppercase tracking-widest">
                                    تاريخ الانتهاء
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="MM/YY"
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none font-bold text-left tracking-widest text-xl"
                                    value={cardData.expiryDate}
                                    onChange={handleExpiryChange}
                                    dir="ltr"
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 mr-2 uppercase tracking-widest">
                                    CVV
                                </label>
                                <input 
                                    type="text" 
                                    required
                                    placeholder="123"
                                    maxLength="3"
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none font-bold text-left tracking-widest text-xl"
                                    value={cardData.cvv}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setCardData({...cardData, cvv: val});
                                    }}
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        {/* شارة الأمان */}
                        <div className="p-5 bg-green-50 rounded-[2.5rem] border border-green-100 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm shrink-0">
                                <Lock size={24} />
                            </div>
                            <div>
                                <p className="font-black text-green-900 text-sm">اتصال آمن ومشفر</p>
                                <p className="text-[10px] text-green-700 font-bold uppercase">
                                    256-bit SSL Encryption
                                </p>
                            </div>
                        </div>

                        {/* زر الدفع */}
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-xl hover:bg-indigo-700 shadow-2xl shadow-indigo-100 flex items-center justify-center gap-4 transition-all active:scale-[0.98] disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={24} />
                                    جاري معالجة الدفع...
                                </>
                            ) : (
                                <>
                                    <ShieldCheck size={24} />
                                    تأكيد الدفع الآن
                                </>
                            )}
                        </button>

                        {/* ملاحظة */}
                        <p className="text-center text-gray-400 text-xs font-bold mt-6">
                            بالنقر على "تأكيد الدفع" أنت توافق على شروط وأحكام المتجر
                        </p>
                    </form>
                </div>

                {/* شعارات البطاقات المدعومة */}
                <div className="mt-10 text-center">
                    <p className="text-gray-300 font-black text-xs uppercase tracking-widest mb-4">
                        البطاقات المدعومة
                    </p>
                    <div className="flex justify-center gap-4 items-center">
                        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 font-black text-gray-400 text-sm">
                            VISA
                        </div>
                        <div className="bg-white px-6 py-3 rounded-2xl border border-gray-100 font-black text-gray-400 text-sm">
                            MASTERCARD
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
    CheckCircle, 
    ShoppingBag, 
    Truck, 
    PhoneCall, 
    ArrowLeft,
    Share2,
    Calendar
} from 'lucide-react';

export default function OrderSuccessPage() {
    const { id } = useParams(); // الحصول على رقم الطلب من الرابط
    const router = useRouter();

    // تاريخ اليوم التقريبي للطلب
    const today = new Date().toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 font-sans" dir="rtl">
            <div className="max-w-2xl w-full bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 p-8 md:p-16 text-center relative overflow-hidden">
                
                {/* خلفية فنية خفيفة */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-indigo-500 to-purple-600"></div>

                {/* أيقونة النجاح المتحركة */}
                <div className="mb-8 flex justify-center">
                    <div className="bg-green-100 p-6 rounded-full animate-bounce">
                        <CheckCircle size={60} className="text-green-600" />
                    </div>
                </div>

                <h1 className="text-4xl font-black text-gray-900 mb-4">تم استلام طلبك بنجاح!</h1>
                <p className="text-gray-500 text-lg mb-10 font-medium leading-relaxed">
                    شكراً لثقتك بمتجر <span className="text-indigo-600 font-black">ELIA</span>. <br/> 
                    فريقنا يقوم الآن بتجهيز طلبيتك لتصلك في أسرع وقت.
                </p>

                {/* كرت تفاصيل الطلب السريع */}
                <div className="bg-gray-50 rounded-[2.5rem] p-8 mb-10 border border-gray-100 text-right space-y-4">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                        <span className="text-gray-400 font-bold flex items-center gap-2"><ShoppingBag size={18}/> رقم الطلب:</span>
                        <span className="font-black text-indigo-600 text-xl tracking-tighter">#{id?.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                        <span className="text-gray-400 font-bold flex items-center gap-2"><Calendar size={18}/> تاريخ الطلب:</span>
                        <span className="font-black text-gray-800">{today}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 font-bold flex items-center gap-2"><Truck size={18}/> حالة التوصيل:</span>
                        <span className="bg-orange-100 text-orange-600 px-4 py-1 rounded-full text-xs font-black">قيد المعالجة</span>
                    </div>
                </div>

                {/* قسم المساعدة */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    <div className="p-4 bg-indigo-50 rounded-2xl flex items-center gap-4 text-right">
                        <PhoneCall className="text-indigo-600" size={24} />
                        <div>
                            <p className="text-xs text-gray-400 font-bold">هل لديك استفسار؟</p>
                            <p className="text-sm font-black text-indigo-900">اتصل بنا: 07XXXXXXXXX</p>
                        </div>
                    </div>
                    <button className="p-4 bg-gray-50 rounded-2xl flex items-center justify-center gap-3 text-gray-600 hover:bg-gray-100 transition-all font-bold">
                        <Share2 size={20} /> مشاركة تفاصيل الطلب
                    </button>
                </div>

                {/* أزرار الإجراءات */}
                <div className="flex flex-col gap-4">
                    <Link href="/">
                        <button className="w-full bg-black text-white py-5 rounded-[1.5rem] font-black text-xl hover:bg-gray-800 transition-all shadow-xl flex items-center justify-center gap-3">
                            <ArrowLeft size={20} /> العودة للمتجر
                        </button>
                    </Link>
                </div>

                <p className="mt-8 text-xs text-gray-400 font-bold">سيتواصل معك مندوب التوصيل خلال 24-48 ساعة لتأكيد موعد التسليم.</p>
            </div>
        </div>
    );
}
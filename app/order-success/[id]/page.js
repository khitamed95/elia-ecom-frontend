'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { 
    CheckCircle2, 
    Package, 
    Truck, 
    Clock,
    ArrowRight,
    Loader2,
    Home,
    Eye
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function OrderSuccessPage() {
    const { id } = useParams();
    const router = useRouter();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);
            } catch (error) {
                console.error('خطأ في جلب الطلب:', error);
                // لا نعيد توجيه في الخطأ، بل نعرض الرقم من URL فقط
                setOrder(null);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-green-600" size={50} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-6 md:p-12 font-sans" dir="rtl">
            <div className="max-w-3xl mx-auto">
                
                {/* رسالة النجاح */}
                <div className="text-center mb-12">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle2 className="text-green-600" size={60} />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-3">تم استلام طلبك بنجاح! 🎉</h1>
                    <p className="text-gray-600 font-bold mb-4">شكراً لاختيارك ELIA ECOM</p>
                    <p className="text-sm text-gray-500">رقم الطلب: <span className="font-black text-green-600">#{id}</span></p>
                </div>

                {/* بطاقة معلومات الطلب */}
                {order && (
                    <div className="bg-white rounded-[3rem] shadow-lg border border-green-100 p-8 mb-8">
                        
                        {/* حالة الطلب */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
                                        <Clock className="text-yellow-600" size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900">حالة الطلب</p>
                                        <p className="text-sm text-gray-500">قيد المعالجة</p>
                                    </div>
                                </div>
                                <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-black text-sm">جاري التحضير</span>
                            </div>

                            {/* خطوات الطلب */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-black">✓</div>
                                    <div>
                                        <p className="font-bold text-gray-900">تم استقبال طلبك</p>
                                        <p className="text-sm text-gray-500">تم حفظ البيانات بنجاح</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-yellow-300 rounded-full flex items-center justify-center text-gray-900 font-black">⏳</div>
                                    <div>
                                        <p className="font-bold text-gray-900">جاري التحضير</p>
                                        <p className="text-sm text-gray-500">سيتم تجهيز الطلب خلال 24 ساعة</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-black">→</div>
                                    <div>
                                        <p className="font-bold text-gray-900">قيد الشحن</p>
                                        <p className="text-sm text-gray-500">سيتم إرسال رابط التتبع عند الشحن</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-black">→</div>
                                    <div>
                                        <p className="font-bold text-gray-900">تم التسليم</p>
                                        <p className="text-sm text-gray-500">تسليم آمن إلى باب منزلك</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* معلومات التوصيل */}
                        <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                            
                            <div>
                                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                                    <Truck className="text-indigo-600" size={20} />
                                    معلومات التوصيل
                                </h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">المدينة</p>
                                        <p className="text-sm font-bold text-gray-800">{order.shippingAddress?.city || 'غير متوفر'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">العنوان</p>
                                        <p className="text-sm font-bold text-gray-800">{order.shippingAddress?.address || 'غير متوفر'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">رقم الهاتف</p>
                                        <p className="text-sm font-bold text-gray-800" dir="ltr">{order.phone || 'غير متوفر'}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                                    <Package className="text-green-600" size={20} />
                                    ملخص الطلب
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 font-bold">عدد المنتجات</span>
                                        <span className="font-black text-gray-900">{order.orderItems?.length || 0} منتج</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 font-bold">سعر المنتجات</span>
                                        <span className="font-black text-gray-900">{order.itemsPrice?.toLocaleString()} د.ع</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 font-bold">التوصيل</span>
                                        <span className="font-black text-gray-900">{order.shippingPrice?.toLocaleString()} د.ع</span>
                                    </div>
                                    <div className="flex justify-between pt-3 border-t border-gray-100">
                                        <span className="text-gray-900 font-black">الإجمالي</span>
                                        <span className="text-xl font-black text-green-600">{order.totalPrice?.toLocaleString()} د.ع</span>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {/* المنتجات المطلوبة */}
                {order?.orderItems && order.orderItems.length > 0 && (
                    <div className="bg-white rounded-[3rem] shadow-lg border border-green-100 p-8 mb-8">
                        <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2 text-lg">
                            <Package className="text-indigo-600" size={24} />
                            المنتجات المطلوبة
                        </h3>
                        <div className="space-y-4">
                            {order.orderItems.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 pb-4 border-b border-gray-100 last:border-b-0">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img 
                                            src={item.image} 
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900">{item.name}</p>
                                        <p className="text-sm text-gray-500">{item.color} | {item.size} | {item.qty}x</p>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-gray-900">{(item.price * item.qty).toLocaleString()} د.ع</p>
                                        <p className="text-xs text-gray-400">{item.price.toLocaleString()} د.ع × {item.qty}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* الأزرار */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                        onClick={() => router.push('/profile/orders')}
                        className="flex-1 bg-green-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                        <Eye size={20} /> متابعة الطلب
                    </button>
                    <button 
                        onClick={() => router.push('/')}
                        className="flex-1 bg-gray-100 text-gray-900 py-5 rounded-2xl font-black text-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                        <Home size={20} /> الصفحة الرئيسية
                    </button>
                </div>

                {/* ملاحظة مهمة */}
                <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-sm text-gray-700 font-bold">
                        <strong className="text-blue-600">ملاحظة مهمة:</strong> تحقق من بريدك الإلكتروني أو رسائلك النصية لتلقي تحديثات الطلب. إذا كان لديك أي استفسارات، يرجى التواصل معنا عبر قنوات الدعم.
                    </p>
                </div>

            </div>
        </div>
    );
}
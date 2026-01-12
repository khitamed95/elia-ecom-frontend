'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { 
    Package, 
    Truck, 
    CheckCircle2, 
    Clock, 
    MapPin, 
    Phone,
    Calendar,
    ArrowRight,
    Loader2,
    AlertCircle,
    ShoppingBag,
    XCircle
} from 'lucide-react';

const OrderStatus = {
    pending: { label: 'قيد المعالجة', color: 'bg-yellow-500', icon: Clock },
    processing: { label: 'جاري التحضير', color: 'bg-blue-500', icon: Package },
    shipped: { label: 'تم الشحن', color: 'bg-indigo-500', icon: Truck },
    delivered: { label: 'تم التسليم', color: 'bg-green-500', icon: CheckCircle2 },
    cancelled: { label: 'ملغي', color: 'bg-red-500', icon: XCircle }
};

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders/myorders');
            setOrders(data);
        } catch (error) {
            console.error('خطأ في جلب الطلبات:', error);
            if (error.response?.status === 401) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-IQ', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold">جاري تحميل طلباتك...</p>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
                <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100 max-w-md w-full text-center">
                    <ShoppingBag size={80} className="mx-auto text-indigo-100 mb-6" />
                    <h2 className="text-2xl font-black text-gray-800 mb-2">لا توجد طلبات</h2>
                    <p className="text-gray-400 font-bold mb-8 text-sm">لم تقم بإجراء أي طلبات حتى الآن</p>
                    <button 
                        onClick={() => router.push('/')} 
                        className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-black transition-all"
                    >
                        ابدأ التسوق الآن
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans" dir="rtl">
            <div className="max-w-5xl mx-auto">
                {/* العنوان */}
                <div className="mb-10">
                    <button 
                        onClick={() => router.back()} 
                        className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 mb-6 font-black transition-all group"
                    >
                        <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" /> 
                        العودة
                    </button>
                    <h1 className="text-4xl font-black text-gray-900 mb-2 flex items-center gap-4">
                        <Package className="text-indigo-600" size={36} />
                        طلباتي
                    </h1>
                    <p className="text-gray-400 font-bold">تتبع جميع طلباتك من متجر ELIA</p>
                </div>

                {/* قائمة الطلبات */}
                <div className="space-y-6">
                    {orders.map((order) => {
                        const status = OrderStatus[order.status] || OrderStatus.pending;
                        const StatusIcon = status.icon;
                        const isExpanded = expandedOrder === order.id;

                        return (
                            <div 
                                key={order.id} 
                                className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md"
                            >
                                {/* رأس الطلب */}
                                <div 
                                    className="p-8 cursor-pointer"
                                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 ${status.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                                                <StatusIcon size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black text-gray-900">
                                                    طلب رقم #{order.id}
                                                </h3>
                                                <p className="text-xs text-gray-400 font-bold">{status.label}</p>
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-2xl font-black text-indigo-600">
                                                {order.totalPrice?.toLocaleString()} د.ع
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                الإجمالي
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="flex items-center gap-3">
                                            <Calendar size={16} className="text-gray-300" />
                                            <div>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase">التاريخ</p>
                                                <p className="text-xs font-black text-gray-700">
                                                    {new Date(order.createdAt).toLocaleDateString('ar-IQ')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Package size={16} className="text-gray-300" />
                                            <div>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase">العناصر</p>
                                                <p className="text-xs font-black text-gray-700">
                                                    {order.orderItems?.length || 0} منتج
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <MapPin size={16} className="text-gray-300" />
                                            <div>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase">المدينة</p>
                                                <p className="text-xs font-black text-gray-700">
                                                    {order.shippingAddress?.city || 'بغداد'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Phone size={16} className="text-gray-300" />
                                            <div>
                                                <p className="text-[9px] text-gray-400 font-bold uppercase">الهاتف</p>
                                                <p className="text-xs font-black text-gray-700" dir="ltr">
                                                    {order.phone || 'غير متوفر'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* تفاصيل الطلب المنسدلة */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 bg-gray-50 p-8">
                                        {/* معلومات الشحن */}
                                        <div className="mb-8">
                                            <h4 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                                                <MapPin size={18} className="text-indigo-500" />
                                                عنوان التوصيل
                                            </h4>
                                            <div className="bg-white p-6 rounded-2xl border border-gray-100">
                                                <p className="text-sm font-bold text-gray-700 mb-2">
                                                    {order.shippingAddress?.address || 'العنوان غير متوفر'}
                                                </p>
                                                <p className="text-xs text-gray-400 font-bold">
                                                    {order.shippingAddress?.city || 'بغداد'}, {order.shippingAddress?.country || 'العراق'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* المنتجات */}
                                        <div>
                                            <h4 className="text-sm font-black text-gray-900 mb-4 flex items-center gap-2">
                                                <ShoppingBag size={18} className="text-indigo-500" />
                                                المنتجات المطلوبة
                                            </h4>
                                            <div className="space-y-4">
                                                {order.orderItems?.map((item, index) => (
                                                    <div 
                                                        key={index} 
                                                        className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center gap-5"
                                                    >
                                                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                                                            <img 
                                                                src={item.image} 
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h5 className="text-sm font-black text-gray-800 mb-1">
                                                                {item.name}
                                                            </h5>
                                                            <p className="text-[10px] text-gray-400 font-bold uppercase">
                                                                {item.color} | {Number(item.size) > 10 ? `مقاس ${item.size}` : item.size} | الكمية: {item.qty}
                                                            </p>
                                                        </div>
                                                        <div className="text-left">
                                                            <p className="text-lg font-black text-gray-900">
                                                                {(item.price * item.qty).toLocaleString()} د.ع
                                                            </p>
                                                            <p className="text-[9px] text-gray-400 font-bold">
                                                                {item.price.toLocaleString()} د.ع × {item.qty}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* ملخص السعر */}
                                        <div className="mt-8 bg-white p-6 rounded-2xl border border-gray-100">
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm font-bold text-gray-600">
                                                    <span>مجموع المنتجات</span>
                                                    <span>{order.itemsPrice?.toLocaleString()} د.ع</span>
                                                </div>
                                                <div className="flex justify-between text-sm font-bold text-gray-600">
                                                    <span>أجور التوصيل</span>
                                                    <span>{order.shippingPrice?.toLocaleString()} د.ع</span>
                                                </div>
                                                <div className="border-t border-gray-100 pt-3 flex justify-between text-lg font-black">
                                                    <span className="text-gray-900">الإجمالي</span>
                                                    <span className="text-indigo-600">
                                                        {order.totalPrice?.toLocaleString()} د.ع
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* طريقة الدفع */}
                                        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 font-bold">
                                            <CheckCircle2 size={14} className="text-green-500" />
                                            طريقة الدفع: {order.paymentMethod || 'الدفع عند الاستلام'}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* تذييل الصفحة */}
                <div className="mt-12 text-center">
                    <p className="text-gray-300 font-black text-[10px] uppercase tracking-[0.2em]">
                        ELIA Orders Tracking System | 2025
                    </p>
                </div>
            </div>
        </div>
    );
}

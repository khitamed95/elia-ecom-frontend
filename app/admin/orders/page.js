'use client';

export const dynamic = 'force-dynamic';

import * as XLSX from 'xlsx';
import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { 
  ShoppingBag, 
  Truck, 
  CheckCircle, 
  Clock, 
  User, 
  MapPin, 
  Phone,
  Loader2,
  Calendar,
  PackageCheck,
  Download, // أيقونة التحميل العصرية
  Hash,
  CreditCard,
  Package,
  ChevronDown,
  ChevronUp,
  Eye,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            console.log('📦 بيانات الطلبات الواردة:', data);
            console.log('📦 طلب واحد كمثال:', data[0]);
            setOrders(data);
        } catch (error) {
            console.error('❌ خطأ في جلب الطلبات:', error);
            toast.error('تعذر جلب الطلبات من السيرفر');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);

    // دالة تصدير البيانات إلى إكسل
    const handleExport = () => {
        if (orders.length === 0) return toast.info("لا توجد طلبات لتصديرها");

        const dataForDelivery = orders.map(order => {
            const orderIdRaw = order.id ?? order._id ?? '';
            const orderIdSafe = typeof orderIdRaw === 'string' ? orderIdRaw : String(orderIdRaw || '');

            return {
                "رقم الطلب": orderIdSafe.slice(-6).toUpperCase(),
            "اسم الزبون": order.user?.name || "زبون مجهول",
            "رقم الهاتف": order.phone || order.shippingAddress?.phone,
            "المحافظة": order.shippingAddress?.city,
            "العنوان التفصيلي": order.shippingAddress?.address,
            "المبلغ الكلي": `${order.totalPrice} د.ع`,
            "تاريخ الطلب": new Date(order.createdAt).toLocaleDateString('ar-IQ'),
            "الحالة": order.status === 'delivered' ? 'تم التوصيل' : 'قيد المعالجة'
            };
        });

        const ws = XLSX.utils.json_to_sheet(dataForDelivery);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Orders");
        XLSX.writeFile(wb, `ELIA_Orders_${new Date().toISOString().split('T')[0]}.xlsx`);
        toast.success("تم تجهيز ملف الإكسل بنجاح");
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status: newStatus });
            if (newStatus === 'delivered') {
                await api.put(`/orders/${orderId}/deliver`);
            }
            toast.success(`تم تحديث الحالة إلى: ${newStatus}`);
            fetchOrders();
        } catch (error) {
            toast.error('فشل في تحديث الحالة');
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
            <Loader2 className="animate-spin text-indigo-600" size={50} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans" dir="rtl">
            <div className="max-w-6xl mx-auto">
                
                {/* الرأس مع زر التصدير */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4">
                            <ShoppingBag className="text-indigo-600" size={40} />
                            إدارة الطلبات الواردة
                        </h1>
                        <p className="text-gray-500 mt-2 font-bold">لديك {orders.length} طلب في النظام.</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handleExport}
                            title="تصدير لشركة التوصيل"
                            className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-2xl font-black flex items-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg shadow-green-200 group relative hover:scale-105"
                        >
                            <Download size={22} className="animate-bounce" />
                            <span className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                تصدير لشركة التوصيل
                            </span>
                        </button>
                        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
                            <Calendar size={18} className="text-indigo-500" />
                            <span className="text-gray-700 font-black">{new Date().toLocaleDateString('ar-IQ')}</span>
                        </div>
                    </div>
                </div>

                {/* قائمة الطلبات */}
                <div className="space-y-6">
                    {orders.length === 0 ? (
                        <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-200">
                            <PackageCheck size={60} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-400 font-bold text-xl">لا توجد طلبات حالياً</p>
                        </div>
                    ) : (
                        orders.map((order) => {
                            const orderIdRaw = order.id ?? order._id ?? '';
                            const orderIdSafe = typeof orderIdRaw === 'string' ? orderIdRaw : String(orderIdRaw || '');
                            const orderIdShort = orderIdSafe.slice(-8).toUpperCase();
                            
                            return (
                            <div key={order.id || order._id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                                <div className="p-8">
                                    {/* رأس الطلب مع رقم الطلب والتاريخ */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <Hash size={18} className="text-indigo-500" />
                                            <span className="text-sm font-black text-gray-700">رقم الطلب:</span>
                                            <span className="bg-indigo-50 text-indigo-700 px-4 py-1 rounded-lg font-black text-sm">{orderIdShort}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar size={18} className="text-gray-400" />
                                            <span className="text-sm font-bold text-gray-500">
                                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' }) : 'غير محدد'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <CreditCard size={18} className="text-green-500" />
                                            <span className="text-sm font-bold text-gray-700">{order.paymentMethod || 'الدفع عند الاستلام'}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col lg:flex-row justify-between gap-8">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-gray-800">{order.user?.name || 'زبون مجهول'}</h3>
                                                    <p className="text-xs text-gray-400 font-bold">{order.user?.email || ''}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2 text-gray-500 font-bold mr-11">
                                                <p className="flex items-center gap-2">
                                                    <Phone size={16} className="text-green-500" /> 
                                                    {order.phone || order.shippingAddress?.phone || 'غير متوفر'}
                                                </p>
                                                <p className="flex items-center gap-2">
                                                    <MapPin size={16} className="text-red-500" /> 
                                                    {order.shippingAddress?.city || 'غير محدد'} - {order.shippingAddress?.address || 'عنوان غير متوفر'}
                                                </p>
                                                {order.shippingAddress?.postalCode && (
                                                    <p className="flex items-center gap-2 text-xs">
                                                        <span className="text-gray-400">الرمز البريدي:</span>
                                                        <span className="font-black">{order.shippingAddress.postalCode}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 lg:border-r lg:pr-8 border-gray-50">
                                            <p className="text-gray-400 text-sm font-bold mb-1">المبلغ الإجمالي</p>
                                            <p className="text-3xl font-black text-indigo-600">
                                                {Number(order.totalPrice).toLocaleString()} <span className="text-sm">د.ع</span>
                                            </p>
                                            <div className="mt-4">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1 w-fit
                                                    ${order.status === 'delivered' ? 'bg-green-50 text-green-600' : 
                                                      order.status === 'shipped' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    {order.status === 'delivered' ? <CheckCircle size={14}/> : <Clock size={14}/>}
                                                    {order.status === 'delivered' ? 'تم التوصيل' : order.status === 'shipped' ? 'تم الشحن' : 'قيد المعالجة'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col justify-center gap-3">
                                            <button 
                                                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                                className="bg-indigo-50 text-indigo-700 px-6 py-3 rounded-xl font-black hover:bg-indigo-600 hover:text-white transition-all text-sm flex items-center gap-2 justify-center"
                                            >
                                                {expandedOrderId === order.id ? <ChevronUp size={18} /> : <Eye size={18} />}
                                                {expandedOrderId === order.id ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                                            </button>
                                            <button 
                                                onClick={() => updateStatus(order.id, 'shipped')}
                                                disabled={order.status === 'shipped' || order.status === 'delivered'}
                                                className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black hover:bg-indigo-600 disabled:bg-gray-100 disabled:text-gray-400 transition-all text-sm flex items-center gap-2 justify-center"
                                            >
                                                <Truck size={18} /> شحن الطلب
                                            </button>
                                            <button 
                                                onClick={() => updateStatus(order.id, 'delivered')}
                                                disabled={order.status === 'delivered'}
                                                className="bg-green-50 text-green-600 px-6 py-3 rounded-xl font-black hover:bg-green-600 hover:text-white disabled:opacity-50 transition-all text-sm flex items-center gap-2 justify-center"
                                            >
                                                <CheckCircle size={18} /> تم التوصيل
                                            </button>
                                        </div>
                                    </div>

                                    {/* قسم التفاصيل الإضافية القابل للطي */}
                                    {expandedOrderId === order.id && (
                                        <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-100 animate-fade-in-up">
                                            {/* معلومات الطلب الأساسية */}
                                            <div className="mb-6 p-4 bg-white rounded-xl shadow-sm">
                                                <h4 className="text-sm font-black text-gray-700 mb-3 flex items-center gap-2">
                                                    <Hash size={16} />
                                                    معلومات الطلب
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-bold mb-1">رقم الطلب الكامل</p>
                                                        <p className="text-sm font-black text-indigo-700 font-mono">{orderIdSafe}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 font-bold mb-1">تاريخ الإنشاء</p>
                                                        <p className="text-sm font-black text-gray-800">
                                                            {order.createdAt ? new Date(order.createdAt).toLocaleString('ar-IQ', { 
                                                                year: 'numeric', 
                                                                month: 'long', 
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            }) : 'غير محدد'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* إحصائيات الطلب */}
                                            <div className="mb-6 p-4 bg-white rounded-xl shadow-sm">
                                                <h4 className="text-sm font-black text-gray-700 mb-3 flex items-center gap-2">
                                                    <Package size={16} />
                                                    إحصائيات الطلب
                                                </h4>
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                    <div className="text-center p-3 bg-indigo-50 rounded-lg">
                                                        <p className="text-2xl font-black text-indigo-600">
                                                            {order.orderItems?.length || 0}
                                                        </p>
                                                        <p className="text-xs text-gray-600 font-bold mt-1">عدد الأصناف</p>
                                                    </div>
                                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                                        <p className="text-2xl font-black text-green-600">
                                                            {order.orderItems?.reduce((acc, item) => acc + (item.qty || 1), 0) || 0}
                                                        </p>
                                                        <p className="text-xs text-gray-600 font-bold mt-1">إجمالي القطع</p>
                                                    </div>
                                                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                                                        <p className="text-2xl font-black text-purple-600">
                                                            {Number(order.totalPrice || 0).toLocaleString()}
                                                        </p>
                                                        <p className="text-xs text-gray-600 font-bold mt-1">المبلغ الإجمالي (د.ع)</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* تفاصيل الأسعار */}
                                            <h4 className="text-lg font-black text-indigo-900 mb-4 flex items-center gap-2">
                                                <DollarSign size={20} />
                                                تفاصيل الأسعار والدفع
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <div className="bg-white p-4 rounded-xl shadow-sm">
                                                    <p className="text-xs text-gray-500 font-bold mb-1">سعر المنتجات</p>
                                                    <p className="text-2xl font-black text-gray-800">{Number(order.itemsPrice || order.totalPrice).toLocaleString()} د.ع</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl shadow-sm">
                                                    <p className="text-xs text-gray-500 font-bold mb-1">رسوم الشحن</p>
                                                    <p className="text-2xl font-black text-blue-600">{Number(order.shippingPrice || 0).toLocaleString()} د.ع</p>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl shadow-sm">
                                                    <p className="text-xs text-gray-500 font-bold mb-1">الضريبة</p>
                                                    <p className="text-2xl font-black text-orange-600">{Number(order.taxPrice || 0).toLocaleString()} د.ع</p>
                                                </div>
                                            </div>
                                            <div className="mt-4 bg-white p-4 rounded-xl shadow-sm">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-gray-600">حالة الدفع:</span>
                                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black ${
                                                        order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {order.isPaid ? '✓ تم الدفع' : '✗ لم يتم الدفع'}
                                                    </span>
                                                </div>
                                                {order.isPaid && order.paidAt && (
                                                    <p className="text-xs text-gray-400 mt-2">تاريخ الدفع: {new Date(order.paidAt).toLocaleDateString('ar-IQ')}</p>
                                                )}
                                            </div>
                                            <div className="mt-4 bg-white p-4 rounded-xl shadow-sm">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-bold text-gray-600">حالة التوصيل:</span>
                                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black ${
                                                        order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                                    }`}>
                                                        {order.isDelivered ? '✓ تم التوصيل' : '⏳ قيد التوصيل'}
                                                    </span>
                                                </div>
                                                {order.isDelivered && order.deliveredAt && (
                                                    <p className="text-xs text-gray-400 mt-2">تاريخ التوصيل: {new Date(order.deliveredAt).toLocaleDateString('ar-IQ')}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-8 pt-6 border-t border-gray-50">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Package size={18} className="text-gray-600" />
                                            <h4 className="text-sm font-black text-gray-700">المنتجات ({order.orderItems?.length || 0})</h4>
                                        </div>
                                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                            {order.orderItems && order.orderItems.length > 0 ? (
                                                order.orderItems.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-4 bg-gray-50 p-4 rounded-[1.5rem] min-w-[280px] border border-gray-100">
                                                        <img 
                                                            src={item.image?.startsWith('http') ? item.image : `${API_URL}${item.image}`}
                                                            className="w-16 h-16 rounded-xl object-cover shadow-sm" 
                                                            alt={item.name || 'منتج'}
                                                            onError={(e) => { e.target.src = '/placeholder.png'; }}
                                                        />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-black text-gray-800 line-clamp-1">{item.name || 'منتج'}</p>
                                                            <p className="text-[11px] text-gray-400 font-bold uppercase mt-1">
                                                                {item.color && <span>اللون: {item.color}</span>}
                                                                {item.size && <span className="mx-1">| المقاس: {item.size}</span>}
                                                            </p>
                                                            <div className="flex items-center justify-between mt-2">
                                                                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg font-black">
                                                                    الكمية: {item.qty || 1}
                                                                </span>
                                                                <span className="text-sm font-black text-gray-700">
                                                                    {Number(item.price || 0).toLocaleString()} د.ع
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-gray-400 text-sm font-bold">لا توجد منتجات</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
'use client';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { 
    User, 
    Package, 
    Clock, 
    CheckCircle2, 
    Truck, 
    ShoppingBag,
    ChevronLeft,
    Loader2,
    Settings,
    MapPin
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
    const [orders, setOrders] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.158:5000';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // جلب بيانات المستخدم والطلبات في آن واحد لسرعة التحميل
                const [ordersRes, userRes] = await Promise.all([
                    api.get('/orders/myorders'),
                    api.get('/users/profile')
                ]);
                setOrders(ordersRes.data);
                setUser(userRes.data);
            } catch (error) {
                console.error("فشل في جلب بيانات الداشبورد");
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'shipped': return 'bg-blue-100 text-blue-700';
            case 'delivered': return 'bg-green-100 text-green-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'قيد التجهيز';
            case 'shipped': return 'تم الشحن';
            case 'delivered': return 'تم التوصيل';
            default: return 'غير معروف';
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans" dir="rtl">
            <div className="max-w-5xl mx-auto">
                
                {/* الرأس المحدث: يظهر بيانات المستخدم الحقيقية */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl bg-gray-200">
                                {user?.avatar ? (
                                    <img 
                                        src={user.avatar.startsWith('http') ? user.avatar : `${API_URL}${user.avatar}`} 
                                        className="w-full h-full object-cover" 
                                        alt="Profile" 
                                    />
                                ) : (
                                    <User className="w-full h-full p-4 text-gray-400" />
                                )}
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 mb-1 italic">أهلاً، {user?.name || 'عميلنا العزيز'} ✨</h1>
                            <p className="text-gray-400 font-bold text-sm flex items-center gap-2">
                                <MapPin size={14} /> {user?.city || 'بغداد'}، العراق
                            </p>
                        </div>
                    </div>
                    
                    <Link 
                        href="/dashboard/profile" 
                        className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 text-gray-600 font-black hover:bg-indigo-600 hover:text-white transition-all group"
                    >
                        <Settings size={18} className="group-hover:rotate-90 transition-transform" />
                        تعديل الملف الشخصي
                    </Link>
                </div>

                {/* إحصائيات سريعة للزبون */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <Package className="text-indigo-600 mb-4" size={28} />
                        <p className="text-gray-400 text-xs font-black uppercase mb-1">إجمالي الطلبات</p>
                        <h3 className="text-3xl font-black text-gray-800">{orders.length}</h3>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <Clock className="text-orange-500 mb-4" size={28} />
                        <p className="text-gray-400 text-xs font-black uppercase mb-1">تحت التجهيز</p>
                        <h3 className="text-3xl font-black text-gray-800">
                            {orders.filter(o => o.status === 'pending' || o.status === 'processing').length}
                        </h3>
                    </div>
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <CheckCircle2 className="text-green-500 mb-4" size={28} />
                        <p className="text-gray-400 text-xs font-black uppercase mb-1">طلبات واصلة</p>
                        <h3 className="text-3xl font-black text-gray-800">
                            {orders.filter(o => o.status === 'delivered').length}
                        </h3>
                    </div>
                </div>

                {/* قائمة الطلبات */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
                        <ShoppingBag className="text-indigo-600" /> تتبع مشترياتك الأخيرة
                    </h2>

                    {orders.length === 0 ? (
                        <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-200">
                            <ShoppingBag size={60} className="mx-auto text-gray-200 mb-6" />
                            <p className="text-gray-400 font-black mb-8">حقيبة مشترياتك في ELIA فارغة حالياً</p>
                            <Link href="/products" className="bg-black text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-600 transition-all shadow-xl">
                                اكتشف الموديلات الجديدة
                            </Link>
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
                                <div className="p-8">
                                    <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-gray-100 px-4 py-2 rounded-xl font-black text-sm text-gray-600 tracking-tighter">
                                                طلب #{order.id.slice(-6).toUpperCase()}
                                            </div>
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${getStatusColor(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </div>
                                        <div className="text-gray-400 text-xs font-bold flex items-center gap-2">
                                            <Clock size={14} /> {new Date(order.createdAt).toLocaleDateString('ar-IQ', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                    </div>

                                    {/* المنتجات داخل الطلب */}
                                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                        {order.orderItems.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl min-w-[200px] border border-transparent hover:border-indigo-100 transition-colors">
                                                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="font-black text-gray-800 text-xs truncate">{item.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{item.size} | {item.qty} قطعة</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 p-6 px-8 flex justify-between items-center border-t border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-black uppercase">المبلغ الإجمالي</span>
                                        <div className="text-indigo-600 font-black text-2xl tracking-tighter">
                                            {order.totalPrice.toLocaleString()} <span className="text-sm">د.ع</span>
                                        </div>
                                    </div>
                                    <Link 
                                        href={`/order-success/${order.id}`} 
                                        className="bg-white text-gray-800 px-6 py-3 rounded-2xl font-black text-sm border border-gray-200 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all flex items-center gap-2"
                                    >
                                        الفاتورة والتدقيق <ChevronLeft size={16} />
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
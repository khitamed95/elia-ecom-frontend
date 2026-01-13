'use client';

export const dynamic = 'force-dynamic';

import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { ShoppingBag, Clock, CheckCircle, Truck, Eye, Search, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await api.get('/orders');
                setOrders(data);
            } catch (err) {
                toast.error('فشل في تحميل الطلبات');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/orders/${id}/status`, { status });
            toast.success(`تم تحديث حالة الطلب إلى: ${status}`);
            setOrders(orders.map(o => o._id === id ? { ...o, status } : o));
        } catch (err) {
            toast.error('خطأ في التحديث');
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4">
                        <ShoppingBag className="text-indigo-600" /> الطلبات الواردة
                    </h1>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100">
                    <table className="w-full text-right border-collapse">
                        <thead className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest">
                            <tr>
                                <th className="p-6">المعرف</th>
                                <th className="p-6">الزبون</th>
                                <th className="p-6">التاريخ</th>
                                <th className="p-6">الإجمالي</th>
                                <th className="p-6">الحالة</th>
                                <th className="p-6">الإجراء</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm font-bold text-gray-700">
                            {orders.map((order) => (
                                <tr key={order._id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="p-6 text-indigo-600">#{order._id.slice(-6)}</td>
                                    <td className="p-6">{order.user?.name || 'زبون خارجي'}</td>
                                    <td className="p-6">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                                    <td className="p-6 font-black">{order.totalPrice.toLocaleString()} د.ع</td>
                                    <td className="p-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${
                                            order.status === 'Delivered' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                        }`}>
                                            {order.status === 'Delivered' ? 'تم التوصيل' : 'قيد التجهيز'}
                                        </span>
                                    </td>
                                    <td className="p-6 flex gap-2">
                                        <button onClick={() => updateStatus(order._id, 'Delivered')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all">
                                            <CheckCircle size={18} />
                                        </button>
                                        <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
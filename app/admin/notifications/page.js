'use client';
import React, { useState, useEffect } from 'react';
import { Bell, Package, UserPlus, CreditCard, Clock, MessageSquare, Loader2 } from 'lucide-react';
import api from '@/lib/axios';

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            // جلب الطلبات الجديدة
            const ordersRes = await api.get('/orders');
            const recentOrders = ordersRes.data.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= yesterday;
            });

            // جلب المنتجات قليلة المخزون
            const productsRes = await api.get('/products');
            const lowStockProducts = productsRes.data.filter(p => p.countInStock <= 5 && p.countInStock > 0);

            // جلب الرسائل الجديدة
            const messagesRes = await api.get('/contact');
            const newMessages = Array.isArray(messagesRes.data) 
                ? messagesRes.data.filter(m => m.status === 'new')
                : [];

            // إنشاء قائمة التنبيهات
            const alerts = [];

            // تنبيهات الطلبات
            recentOrders.forEach(order => {
                alerts.push({
                    id: `order-${order.id}`,
                    type: 'order',
                    msg: `طلب جديد بقيمة ${order.totalPrice?.toLocaleString()} د.ع`,
                    time: getTimeAgo(order.createdAt),
                    icon: <CreditCard className="text-blue-600"/>,
                    bg: 'bg-blue-50',
                    link: `/admin/order/${order.id}`
                });
            });

            // تنبيهات المخزون
            lowStockProducts.forEach(product => {
                alerts.push({
                    id: `stock-${product.id}`,
                    type: 'stock',
                    msg: `مخزون منخفض: "${product.name}" - متبقي ${product.countInStock} قطعة`,
                    time: 'الآن',
                    icon: <Package className="text-orange-600"/>,
                    bg: 'bg-orange-50',
                    link: `/admin/product/${product.id}`
                });
            });

            // تنبيهات الرسائل
            newMessages.forEach(msg => {
                alerts.push({
                    id: `msg-${msg.id}`,
                    type: 'message',
                    msg: `رسالة جديدة من ${msg.name}: ${msg.subject}`,
                    time: getTimeAgo(msg.createdAt),
                    icon: <MessageSquare className="text-purple-600"/>,
                    bg: 'bg-purple-50',
                    link: '/admin/messages'
                });
            });

            // ترتيب حسب الوقت
            alerts.sort((a, b) => {
                if (a.time === 'الآن') return -1;
                if (b.time === 'الآن') return 1;
                return 0;
            });

            setNotifications(alerts);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'الآن';
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        return `منذ ${diffDays} يوم`;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <Loader2 className="animate-spin text-indigo-600" size={50} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12" dir="rtl">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4">
                        <Bell className="text-yellow-500 animate-swing" size={40} /> مركز التنبيهات
                    </h1>
                    <button 
                        onClick={fetchNotifications}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
                    >
                        تحديث
                    </button>
                </div>

                {notifications.length === 0 ? (
                    <div className="bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100 text-center">
                        <Bell className="text-gray-300 mx-auto mb-4" size={60} />
                        <p className="text-gray-400 font-bold text-lg">لا توجد تنبيهات جديدة</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map(alert => (
                            <div 
                                key={alert.id} 
                                className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between hover:scale-[1.01] transition-transform cursor-pointer"
                                onClick={() => alert.link && (window.location.href = alert.link)}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`${alert.bg} p-4 rounded-2xl`}>{alert.icon}</div>
                                    <div>
                                        <p className="font-bold text-gray-800">{alert.msg}</p>
                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                            <Clock size={12}/> {alert.time}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
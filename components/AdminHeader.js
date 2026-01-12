'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Bell, ShoppingCart, UserPlus, X } from 'lucide-react';

export default function AdminHeader() {
    const [notifications, setNotifications] = useState({ orders: [], users: [] });
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await api.get('/admin/notifications');
                setNotifications(data);
            } catch (err) { console.error(err); }
        };
        fetchNotifications();
        // تحديث الإشعارات كل دقيقة تلقائياً
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const totalNew = notifications.orders.length + notifications.users.length;

    return (
        <div className="relative flex items-center gap-4">
            <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative p-3 bg-gray-100 rounded-2xl hover:bg-indigo-50 transition-colors"
            >
                <Bell size={24} className="text-gray-600" />
                {totalNew > 0 && (
                    <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                        {totalNew}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute top-16 left-0 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-5">
                    <div className="p-5 border-b border-gray-50 flex justify-between items-center">
                        <span className="font-black text-gray-800">التنبيهات الأخيرة</span>
                        <button onClick={() => setShowDropdown(false)}><X size={18} /></button>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                        {/* إشعارات الطلبات */}
                        {notifications.orders.map(order => (
                            <div key={order.id} className="p-4 hover:bg-gray-50 flex gap-3 border-b border-gray-50">
                                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                    <ShoppingCart size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-800">طلب جديد من {order.user.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold">{order.totalPrice.toLocaleString()} د.ع</p>
                                </div>
                            </div>
                        ))}
                        
                        {/* إشعارات المستخدمين الجدد */}
                        {notifications.users.map(user => (
                            <div key={user.id} className="p-4 hover:bg-gray-50 flex gap-3 border-b border-gray-50">
                                <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                                    <UserPlus size={18} />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-gray-800">انضم زبون جديد: {user.name}</p>
                                    <p className="text-[10px] text-gray-400 font-bold">عضو جديد في ELIA</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
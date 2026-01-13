'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Ticket, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function CouponsPage() {
    const [coupons, setCoupons] = useState([]);
    const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', expiryDate: '' });

    const fetchCoupons = async () => {
        const { data } = await api.get('/coupons');
        setCoupons(data);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/coupons', newCoupon);
            toast.success("تم إضافة الكوبون بنجاح");
            setNewCoupon({ code: '', discount: '', expiryDate: '' });
            fetchCoupons();
        } catch (err) { toast.error("خطأ في إنشاء الكوبون"); }
    };

    const deleteCoupon = async (id) => {
        if(confirm("هل أنت متأكد؟")) {
            await api.delete(`/api/coupons/${id}`);
            fetchCoupons();
        }
    };

    useEffect(() => { fetchCoupons(); }, []);

    return (
        <div className="p-8 bg-gray-50 min-h-screen" dir="rtl">
            <h1 className="text-3xl font-black mb-8 flex items-center gap-3">
                <Ticket className="text-indigo-600" size={35} /> إدارة الكوبونات
            </h1>

            {/* نموذج إضافة كوبون */}
            <form onSubmit={handleCreate} className="bg-white p-6 rounded-[2rem] shadow-sm mb-10 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold mb-2">رمز الكوبون</label>
                    <input 
                        type="text" 
                        className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500"
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
                        placeholder="مثال: ELIA10" required
                    />
                </div>
                <div className="w-32">
                    <label className="block text-sm font-bold mb-2">الخصم (%)</label>
                    <input 
                        type="number" 
                        className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500"
                        value={newCoupon.discount}
                        onChange={(e) => setNewCoupon({...newCoupon, discount: e.target.value})}
                        placeholder="10" required
                    />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-bold mb-2">تاريخ الانتهاء</label>
                    <input 
                        type="date" 
                        className="w-full p-3 bg-gray-50 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500"
                        value={newCoupon.expiryDate}
                        onChange={(e) => setNewCoupon({...newCoupon, expiryDate: e.target.value})}
                        required
                    />
                </div>
                <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black hover:bg-indigo-700 transition-all flex items-center gap-2">
                    <Plus size={20} /> إضافة
                </button>
            </form>

            {/* جدول الكوبونات */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map(coupon => (
                    <div key={coupon.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex justify-between items-center group hover:shadow-md transition-all">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl font-black text-gray-800">{coupon.code}</span>
                                {new Date(coupon.expiryDate) > new Date() ? <CheckCircle className="text-green-500" size={16}/> : <XCircle className="text-red-500" size={16}/>}
                            </div>
                            <p className="text-indigo-600 font-bold">خصم {coupon.discount}%</p>
                            <p className="text-gray-400 text-xs mt-2">ينتهي في: {new Date(coupon.expiryDate).toLocaleDateString('ar-IQ')}</p>
                        </div>
                        <button onClick={() => deleteCoupon(coupon.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 size={24} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
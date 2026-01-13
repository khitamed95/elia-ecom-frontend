'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { 
  Settings, 
  Truck, 
  Phone, 
  Save, 
  ShieldCheck,
  Loader2,
  DollarSign,
  Info
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [settings, setSettings] = useState({
        storeName: 'ELIA E-COMMERCE',
        supportPhone: '',
        deliveryBaghdad: 5000,
        deliveryProvinces: 8000,
        currencyRate: 1500, // حقل سعر الصرف الجديد
        maintenance: false,
    });

    // جلب الإعدادات من السيرفر عند تحميل الصفحة
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/admin/settings');
                if (data) {
                    setSettings({
                        storeName: data.storeName || 'ELIA',
                        supportPhone: data.supportPhone || '',
                        deliveryBaghdad: data.deliveryBaghdad || 5000,
                        deliveryProvinces: data.deliveryProvinces || 8000,
                        currencyRate: data.currencyRate || 1500,
                        maintenance: data.maintenance || false,
                    });
                }
            } catch (error) {
                console.error('فشل جلب الإعدادات');
            } finally {
                setFetching(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setLoading(true);
        try {
            // تحديث الإعدادات في قاعدة البيانات عبر Prisma
            await api.put('/admin/settings', settings);
            toast.success('تم حفظ الإعدادات بنجاح');
        } catch (error) {
            toast.error('فشل حفظ الإعدادات، تأكد من اتصال السيرفر');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
            <Loader2 className="animate-spin text-indigo-600" size={50} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans" dir="rtl">
            <div className="max-w-4xl mx-auto">
                
                {/* الرأس */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4">
                            <Settings className="text-indigo-600" size={40} />
                            إعدادات النظام
                        </h1>
                        <p className="text-gray-500 mt-2 font-medium">إدارة الأسعار، التوصيل، وحالة المتجر العامة</p>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full md:w-auto bg-gray-900 text-white px-10 py-4 rounded-[1.5rem] font-black flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        حفظ كافة التغييرات
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    
                    {/* قسم المالية والصرف (جديد) */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-2">
                            <DollarSign className="text-green-600" /> العملة وسعر الصرف
                        </h3>
                        <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-1">
                                <p className="font-bold text-green-800 mb-1 text-sm">سعر صرف الدولار (1$)</p>
                                <p className="text-xs text-green-600 font-medium">سيتم تحويل أسعار المنتجات تلقائياً للزبائن بناءً على هذا السعر.</p>
                            </div>
                            <div className="relative w-full md:w-48">
                                <input 
                                    type="number" 
                                    className="w-full p-4 bg-white rounded-2xl outline-none border-2 border-green-200 focus:border-green-500 font-black text-center text-xl"
                                    value={settings.currencyRate}
                                    onChange={(e) => setSettings({...settings, currencyRate: e.target.value})}
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-800 font-black text-xs">د.ع</span>
                            </div>
                        </div>
                    </div>

                    {/* قسم التوصيل والشحن */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-2">
                            <Truck className="text-indigo-600" /> تكاليف التوصيل
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 mr-2 uppercase tracking-widest">توصيل داخل بغداد</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all"
                                        value={settings.deliveryBaghdad}
                                        onChange={(e) => setSettings({...settings, deliveryBaghdad: e.target.value})}
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">د.ع</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 mr-2 uppercase tracking-widest">توصيل المحافظات</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all"
                                        value={settings.deliveryProvinces}
                                        onChange={(e) => setSettings({...settings, deliveryProvinces: e.target.value})}
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">د.ع</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* معلومات التواصل */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-2">
                            <Phone className="text-indigo-600" /> قنوات التواصل
                        </h3>
                        <div className="space-y-6">
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-black text-gray-400 mr-2 uppercase tracking-widest">رقم واتساب الدعم الفني</label>
                                <input 
                                    type="text" 
                                    placeholder="07XXXXXXXXX"
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none font-bold transition-all"
                                    value={settings.supportPhone}
                                    onChange={(e) => setSettings({...settings, supportPhone: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* وضع الصيانة */}
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-red-50">
                        <h3 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-2">
                            <ShieldCheck className="text-red-600" /> إدارة الوصول
                        </h3>
                        <div className="flex items-center justify-between p-6 bg-red-50 rounded-[2rem] border border-red-100">
                            <div className="flex items-start gap-4">
                                <div className="bg-red-100 p-3 rounded-xl text-red-600">
                                    <Info size={24} />
                                </div>
                                <div>
                                    <p className="font-black text-red-900">وضع الصيانة (Maintenance Mode)</p>
                                    <p className="text-sm text-red-600/70 font-medium">سيتم تعطيل تصفح المتجر للزبائن مع بقاء لوحة التحكم متاحة لك.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer scale-110">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer"
                                    checked={settings.maintenance}
                                    onChange={(e) => setSettings({...settings, maintenance: e.target.checked})}
                                />
                                <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-gray-400 text-sm font-bold tracking-widest">إصدار النظام v2.5.0 | ELIA SECURITY</p>
                </div>
            </div>
        </div>
    );
}
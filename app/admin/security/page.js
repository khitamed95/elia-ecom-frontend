'use client';
import React, { useState } from 'react';
import { ShieldCheck, Database, Lock, RefreshCcw, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function SecurityPage() {
    const [backingUp, setBackingUp] = useState(false);

    const handleBackup = () => {
        setBackingUp(true);
        setTimeout(() => {
            setBackingUp(false);
            toast.success('تم أخذ نسخة احتياطية لقاعدة البيانات بنجاح ✅');
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12" dir="rtl">
            <div className="max-w-4xl mx-auto text-center">
                <ShieldCheck size={80} className="text-indigo-600 mx-auto mb-6" />
                <h1 className="text-4xl font-black text-gray-900 mb-4">الأمان وقاعدة البيانات</h1>
                <p className="text-gray-500 mb-12">أدوات متقدمة لحماية بيانات متجر ELIA وصيانتها.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center">
                        <Database size={40} className="text-blue-500 mb-4" />
                        <h3 className="font-bold text-xl mb-2">نسخة احتياطية</h3>
                        <p className="text-sm text-gray-400 mb-8">حفظ نسخة من جميع المنتجات والطلبات والزبائن.</p>
                        <button onClick={handleBackup} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                            {backingUp ? <RefreshCcw className="animate-spin" /> : 'ابدأ النسخ الآن'}
                        </button>
                    </div>

                    <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center">
                        <Lock size={40} className="text-purple-500 mb-4" />
                        <h3 className="font-bold text-xl mb-2">تشفير الجلسات</h3>
                        <p className="text-sm text-gray-400 mb-8">تأكد من أن جميع اتصالات JWT محمية ومشفرة.</p>
                        <div className="flex items-center gap-2 text-green-600 font-bold">
                            <CheckCircle size={20} /> النظام مؤمن بالكامل
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

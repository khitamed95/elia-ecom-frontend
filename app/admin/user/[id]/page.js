'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { toast } from 'react-toastify';
import { UserCog, Save, ArrowRight, Loader2 } from 'lucide-react';

export default function EditUserPage() {
    const { id } = useParams();
    const router = useRouter();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);

    // 1. جلب بيانات المستخدم (مرة واحدة فقط عند فتح الصفحة)
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data } = await api.get(`/api/users/${id}`);
                setName(data.name);
                setEmail(data.email);
                setIsAdmin(data.isAdmin);
                setLoading(false);
            } catch (err) {
                toast.error('تعذر جلب بيانات المستخدم');
                router.replace('/admin/user'); // العودة للقائمة في حال الخطأ
            }
        };

        if (id) fetchUserData();
    }, [id]); // تم إزالة router من هنا لمنع الـ Refresh اللانهائي

    // 2. دالة التعديل
    const submitHandler = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            await api.put(`/api/users/${id}`, { name, email, isAdmin });
            toast.success('تم تحديث بيانات المستخدم بنجاح');
            router.push('/admin/user'); // العودة للقائمة بعد النجاح
        } catch (err) {
            toast.error(err.response?.data?.message || 'فشل التحديث');
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12" dir="rtl">
            <div className="max-w-3xl mx-auto">
                {/* زر العودة بنفس التنسيق الجميل */}
                <button 
                    onClick={() => router.back()} 
                    className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 transition-all font-bold"
                >
                    <ArrowRight size={20} /> العودة للوحة التحكم
                </button>

                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg">
                            <UserCog size={28} />
                        </div>
                        <h1 className="text-3xl font-black text-gray-800">تعديل حساب: {name}</h1>
                    </div>

                    <form onSubmit={submitHandler} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 mr-2">الاسم الكامل</label>
                            <input 
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 mr-2">البريد الإلكتروني</label>
                            <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-left"
                                dir="ltr"
                                required
                            />
                        </div>

                        {/* تحويل الصلاحية لزر تحكم Toggle تفاعلي */}
                        <div className="bg-indigo-50 p-6 rounded-2xl flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-indigo-900">رتبة المسؤول (Admin)</h4>
                                <p className="text-xs text-indigo-400">إعطاء هذا المستخدم صلاحية الوصول للوحة التحكم</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setIsAdmin(!isAdmin)}
                                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${isAdmin ? 'bg-indigo-600' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 ${isAdmin ? '-translate-x-1' : '-translate-x-6'}`} />
                            </button>
                        </div>

                        <button 
                            type="submit" 
                            disabled={updateLoading}
                            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2"
                        >
                            {updateLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            حفظ التغييرات الجديدة
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
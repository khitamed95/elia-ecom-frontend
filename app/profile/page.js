'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { 
    User, 
    Camera, 
    Mail, 
    Save, 
    Loader2, 
    ArrowRight,
    ShieldCheck,
    LogOut,
    MessageSquare
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const [initialLoading, setInitialLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0); // لإعادة تحميل البيانات
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.158:5000';
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [image, setImage] = useState(null); // للملف المرفوع
    const [preview, setPreview] = useState(''); // لمعاينة الصورة قبل الحفظ

    // 1. جلب بيانات المستخدم الحالية
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const { data } = await api.get('/users/profile');
                setName(data.name);
                setEmail(data.email);
                // تعيين الصورة الحالية كمعاينة (إضافة عنوان Backend للصور)
                if (data.avatar) {
                    const avatarUrl = data.avatar.startsWith('http') 
                        ? data.avatar 
                        : `${API_URL}${data.avatar}`;
                    setPreview(avatarUrl);
                } else {
                    setPreview('');
                }
                setImage(null); // إعادة تعيين الصورة المرفوعة
            } catch (err) {
                console.error('❌ Profile fetch error:');
                console.error('Status:', err.response?.status);
                console.error('Data:', err.response?.data);
                console.error('Message:', err.message);
                console.error('URL:', err.config?.url);
                console.error('Full Error:', err);
                
                // معالجة أفضل للأخطاء
                if (err.response?.status === 500) {
                    toast.error('خطأ في الخادم - يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني');
                } else if (err.response?.status === 401) {
                    toast.error('انتهت جلستك - يرجى تسجيل الدخول مرة أخرى');
                    localStorage.removeItem('userInfo');
                    router.push('/login');
                } else if (err.response?.status === 404) {
                    toast.error('لم يتم العثور على بيانات المستخدم');
                    localStorage.removeItem('userInfo');
                    router.push('/login');
                } else if (!err.response) {
                    toast.error('خطأ في الاتصال بالسيرفر - تحقق من الشبكة');
                } else {
                    toast.error('حدث خطأ أثناء جلب البيانات');
                    router.push('/login');
                }
            } finally {
                setInitialLoading(false);
            }
        };
        fetchUserData();
    }, [router, refreshKey]); // إضافة refreshKey للاعتمادات

    // 2. معالجة اختيار الصورة
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file)); // إنشاء رابط مؤقت للمعاينة
        }
    };

    // 3. دالة الحفظ (إرسال البيانات كـ FormData)
    const submitHandler = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);

        // 🟢 السر هنا: استخدام FormData لرفع الصور والبيانات معاً
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        if (image) {
            formData.append('avatar', image);
        }

        try {
            const { data } = await api.put('/users/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            // تحديث بيانات التخزين المحلي (LocalStorage) إذا لزم الأمر
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const updatedUserInfo = { 
                ...userInfo, 
                name: data.name, 
                email: data.email,
                avatar: data.avatar,
                id: data.id || userInfo.id,
                isAdmin: data.isAdmin !== undefined ? data.isAdmin : userInfo.isAdmin,
                // الحفاظ على الـ token
                token: userInfo.token || userInfo.accessToken,
                accessToken: userInfo.accessToken || userInfo.token
            };
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

            // إطلاق حدث لتحديث Header
            window.dispatchEvent(new CustomEvent('userLogin'));
            
            toast.success('تم تحديث بروفايلك بنجاح ✨');
            
            // الرجوع للصفحة الرئيسية
            setTimeout(() => {
                router.push('/');
            }, 1000);
        } catch (err) {
            toast.error(err.response?.data?.message || 'فشل التحديث، تأكد من حجم الصورة');
        } finally {
            setUpdateLoading(false);
        }
    };

    if (initialLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={50} /></div>;

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans" dir="rtl">
            <div className="max-w-3xl mx-auto">
                
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 mb-8 font-bold transition-all">
                    <ArrowRight size={20} /> العودة للمتجر
                </button>

                <div className="bg-white rounded-[3.5rem] shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header الزينة */}
                    <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative"></div>
                    
                    <form onSubmit={submitHandler} className="p-8 md:p-12 -mt-16 relative">
                        {/* قسم الصورة */}
                        <div className="flex flex-col items-center mb-10">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-gray-200">
                                    {preview ? (
                                        <img src={preview} className="w-full h-full object-cover" alt="Profile" />
                                    ) : (
                                        <User className="w-full h-full p-6 text-gray-400" />
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-black text-white p-3 rounded-2xl cursor-pointer hover:bg-indigo-600 transition-all shadow-lg">
                                    <Camera size={20} />
                                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                </label>
                            </div>
                            <h2 className="mt-4 text-2xl font-black text-gray-800">{name}</h2>
                               <p className="text-gray-200 font-medium text-sm italic">{email}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-black text-gray-400 mr-2 flex items-center gap-2">
                                    <User size={16} /> الاسم بالكامل
                                </label>
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold outline-none"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-black text-gray-400 mr-2 flex items-center gap-2">
                                    <Mail size={16} /> البريد الإلكتروني
                                </label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold outline-none text-left text-gray-400"
                                    dir="ltr"
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col gap-4">
                            <button 
                                type="submit" 
                                disabled={updateLoading}
                                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all"
                            >
                                {updateLoading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                                حفظ التغييرات الحالية
                            </button>

                          

                            <button 
                                type="button"
                                onClick={() => { localStorage.clear(); router.push('/login'); }}
                                className="w-full py-4 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 rounded-2xl transition-all"
                            >
                                <LogOut size={20} /> تسجيل الخروج
                            </button>
                        </div>
                    </form>
                </div>
                
                <div className="mt-8 flex justify-center items-center gap-2 text-gray-400 font-bold text-xs">
                    <ShieldCheck size={16} /> جميع بياناتك مشفرة ومؤمنة في نظام ELIA
                </div>
            </div>
        </div>
    );
}
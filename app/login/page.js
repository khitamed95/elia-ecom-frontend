'use client';
import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useGoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const router = useRouter();

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    // تسجيل الدخول عبر جوجل
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                const { data } = await api.post('/users/auth/google', {
                    accessToken: tokenResponse.access_token
                });

                // حفظ في localStorage
                localStorage.setItem('userInfo', JSON.stringify(data));
                
                // حفظ في Cookies للـ Server Components
                document.cookie = `accessToken=${data.accessToken || data.token}; path=/; max-age=2592000; SameSite=Strict`;
                document.cookie = `userInfo=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=2592000; SameSite=Strict`;
                
                window.dispatchEvent(new CustomEvent('userLogin', { detail: data }));
                toast.success(`مرحباً بك، ${data.name}`);
                router.replace(data.isAdmin ? '/admin' : '/');
            } catch (error) {
                const msg = error.response?.data?.message || 'فشل الدخول عبر Google';
                toast.error(msg);
            } finally {
                setLoading(false);
            }
        },
        onError: () => toast.error('فشل الاتصال بحساب Google')
    });

    // حماية الصفحة: إذا كان مسجلاً، يذهب للرئيسية
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            router.replace('/');
        } else {
            setChecking(false);
        }
    }, [router]);

    // دالة الدخول اليدوي
    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // ✅ المسار الموحد والمباشر
            const { data } = await api.post('/users/login', { email, password });

            // حفظ في localStorage
            localStorage.setItem('userInfo', JSON.stringify(data));
            
            // حفظ في Cookies للـ Server Components (30 يوم)
            const token = data.accessToken || data.token;
            document.cookie = `accessToken=${token}; path=/; max-age=2592000; SameSite=Strict`;
            document.cookie = `userInfo=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=2592000; SameSite=Strict`;
            
            window.dispatchEvent(new CustomEvent('userLogin', { detail: data }));
            
            toast.success(`أهلاً بك مجدداً ${data.name}`);
            
            setTimeout(() => {
                router.replace(data.isAdmin ? '/admin' : '/');
            }, 500);

        } catch (err) {
            // ✅ فك تشفير الخطأ لإظهار الرسالة الحقيقية
            const serverMessage = err.response?.data?.message || err.response?.data || err.message;
            
            console.error('❌ Login Error:', {
                status: err.response?.status,
                data: err.response?.data
            });

            if (err.response?.status === 401) {
                toast.error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
            } else if (err.code === 'ERR_NETWORK') {
                toast.error('تعذر الاتصال بالسيرفر، تأكد من تشغيل الـ Backend');
            } else {
                toast.error(typeof serverMessage === 'string' ? serverMessage : 'خطأ في بيانات الدخول');
            }
        } finally {
            setLoading(false);
        }
    };

    if (checking) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6" dir="rtl">
            <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 border border-gray-100 animate-in fade-in duration-500">
                <div className="text-center mb-10">
                    <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-100">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">تسجيل الدخول</h1>
                    <p className="text-slate-500 mt-2 font-medium">مرحباً بك في عالم ELIA</p>
                </div>

                <form onSubmit={submitHandler} className="space-y-5">
                    <div className="relative group">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input 
                            type="email" placeholder="البريد الإلكتروني" 
                            className="w-full pr-12 pl-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all font-bold"
                            value={email} onChange={(e) => setEmail(e.target.value)} required
                        />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input 
                            type="password" placeholder="كلمة المرور" 
                            className="w-full pr-12 pl-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600/20 transition-all font-bold"
                            value={password} onChange={(e) => setPassword(e.target.value)} required
                        />
                    </div>
                    
                    <div className="flex justify-end">
                        <Link href="/forgot-password" size="sm" className="text-xs text-indigo-600 font-black hover:underline">
                            نسيت كلمة المرور؟
                        </Link>
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-black shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'دخول للمتجر'}
                    </button>
                </form>

                <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-gray-100"></div>
                    <span className="text-gray-300 text-xs font-bold uppercase">أو</span>
                    <div className="flex-1 h-px bg-gray-100"></div>
                </div>

                <button 
                    type="button"
                    onClick={() => googleLogin()}
                    className="w-full bg-white border border-gray-200 text-gray-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google" />
                    الدخول عبر Google
                </button>

                <p className="text-center mt-10 text-slate-500 font-medium text-sm">
                    ليس لديك حساب؟ 
                    <button className="text-indigo-600 font-black mr-2 hover:underline" onClick={() => router.push('/register')}>سجل الآن</button>
                </p>
            </div>
        </div>
    );
}
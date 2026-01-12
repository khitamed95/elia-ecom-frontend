'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';

export default function ResetPasswordPage() {
    const { token } = useParams();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

    useEffect(() => {
        // التحقق من صلاحية الرمز عند تحميل الصفحة
        const validateToken = async () => {
            try {
                await api.get(`/api/users/reset-password/${token}`);
                setTokenValid(true);
            } catch (error) {
                toast.error('رابط إعادة التعيين غير صالح أو منتهي الصلاحية');
                setTokenValid(false);
            } finally {
                setValidating(false);
            }
        };
        validateToken();
    }, [token]);

    // تحقق قوة الباسوورد
    const validatePassword = (pwd) => {
        const minLength = /.{8,}/;
        const upper = /[A-Z]/;
        const lower = /[a-z]/;
        const number = /[0-9]/;
        const symbol = /[^A-Za-z0-9]/;
        if (!minLength.test(pwd)) return 'يجب أن تكون 8 أحرف على الأقل';
        if (!upper.test(pwd)) return 'يجب أن تحتوي على حرف كبير واحد على الأقل';
        if (!lower.test(pwd)) return 'يجب أن تحتوي على حرف صغير واحد على الأقل';
        if (!number.test(pwd)) return 'يجب أن تحتوي على رقم واحد على الأقل';
        if (!symbol.test(pwd)) return 'يجب أن تحتوي على رمز خاص واحد على الأقل';
        return '';
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('كلمتا المرور غير متطابقتين');
            return;
        }
        const pwdErr = validatePassword(password);
        if (pwdErr) {
            toast.error(pwdErr);
            return;
        }
        setLoading(true);
        try {
            await api.put(`/api/users/reset-password/${token}`, { password });
            toast.success('تم تغيير كلمة المرور بنجاح! يمكنك تسجيل الدخول الآن');
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'حدث خطأ أثناء إعادة تعيين كلمة المرور';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    if (validating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50">
                <div className="text-center">
                    <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
                    <p className="text-gray-600 font-bold">جاري التحقق من الرابط...</p>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-red-50 p-6" dir="rtl">
                <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-red-100 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-800 mb-3">رابط غير صالح</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        رابط إعادة التعيين غير صالح أو منتهي الصلاحية. يرجى طلب رابط جديد.
                    </p>
                    <Link 
                        href="/forgot-password"
                        className="block w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all"
                    >
                        طلب رابط جديد
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50 p-6" dir="rtl">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
                
                {/* العودة للخلف */}
                <Link href="/login" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-8 transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-bold">العودة لتسجيل الدخول</span>
                </Link>

                <div className="text-center mb-10">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-indigo-200">
                        <ShieldCheck size={40} />
                    </div>
                    <h1 className="text-4xl font-black text-gray-800 mb-3">إعادة تعيين كلمة المرور</h1>
                    <p className="text-gray-500">أدخل كلمة المرور الجديدة الخاصة بك</p>
                </div>

                <form onSubmit={submitHandler} className="space-y-6">
                    
                    {/* كلمة المرور الجديدة */}
                    <div className="relative">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type={showPassword ? "text" : "password"}
                            placeholder="كلمة المرور الجديدة" 
                            className="w-full pr-12 pl-12 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-2 border-transparent focus:border-indigo-100"
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required
                            minLength={6}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* تأكيد كلمة المرور */}
                    <div className="relative">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="تأكيد كلمة المرور" 
                            className="w-full pr-12 pl-12 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-2 border-transparent focus:border-indigo-100"
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required
                            minLength={6}
                        />
                        <button 
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {/* شروط كلمة المرور */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                        <p className="text-xs text-blue-800 font-bold mb-2">شروط كلمة المرور:</p>
                        <ul className="text-xs text-blue-700 space-y-1 mr-4 list-disc">
                            <li>8 أحرف على الأقل</li>
                            <li>حرف كبير (A-Z)</li>
                            <li>حرف صغير (a-z)</li>
                            <li>رقم (0-9)</li>
                            <li>رمز خاص (!@#$...)</li>
                        </ul>
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-black text-lg hover:shadow-xl hover:scale-105 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                جاري التحديث...
                            </>
                        ) : (
                            'تحديث كلمة المرور'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        تذكرت كلمة المرور؟{' '}
                        <Link href="/login" className="text-indigo-600 font-bold hover:underline">
                            تسجيل الدخول
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

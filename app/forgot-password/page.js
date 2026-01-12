'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Mail, ArrowLeft, Loader2, Key } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const router = useRouter();

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await api.post('/users/forgot-password', { email });
            setSent(true);
            toast.success('تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني');
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'حدث خطأ، يرجى المحاولة مرة أخرى';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50 p-6" dir="rtl">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
                {/* العودة للخلف */}
                <Link href="/login" className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-8 transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-bold">العودة لتسجيل الدخول</span>
                </Link>

                {!sent ? (
                    <>
                        <div className="text-center mb-10">
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-indigo-200">
                                <Key size={40} />
                            </div>
                            <h1 className="text-4xl font-black text-gray-800 mb-3">نسيت كلمة المرور؟</h1>
                            <p className="text-gray-500">لا تقلق! أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور</p>
                        </div>

                        <form onSubmit={submitHandler} className="space-y-6">
                            <div className="relative">
                                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input 
                                    type="email" 
                                    placeholder="البريد الإلكتروني" 
                                    className="w-full pr-12 pl-4 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all border-2 border-transparent focus:border-indigo-100"
                                    value={email} 
                                    onChange={(e) => setEmail(e.target.value)} 
                                    required
                                />
                            </div>

                            <button 
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-black text-lg hover:shadow-xl hover:scale-105 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        جاري الإرسال...
                                    </>
                                ) : (
                                    'إرسال رابط الاستعادة'
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-3">تم الإرسال بنجاح!</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            تم إرسال رابط إعادة تعيين كلمة المرور إلى:<br/>
                            <span className="font-bold text-indigo-600">{email}</span>
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            يرجى التحقق من بريدك الإلكتروني واتباع التعليمات لإعادة تعيين كلمة المرور.
                        </p>
                        <button 
                            onClick={() => router.push('/login')}
                            className="w-full bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                        >
                            العودة لتسجيل الدخول
                        </button>
                    </div>
                )}

                <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <p className="text-sm text-gray-600 text-center">
                        <span className="font-bold text-blue-600">ملاحظة:</span> إذا لم تستلم البريد، تحقق من مجلد البريد المزعج (Spam)
                    </p>
                </div>
            </div>
        </div>
    );
}

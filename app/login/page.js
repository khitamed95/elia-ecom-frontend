'use client';
import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { LogIn, Mail, Lock, Loader2, AtSign } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import AnimatedInput from '@/components/AnimatedInput';
import AnimatedButton from '@/components/AnimatedButton';

export default function LoginPage() {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);
    const [errors, setErrors] = useState({});
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectParam = searchParams?.get('redirect') || '';

    const computeTargetRoute = (user) => {
        const requested = decodeURIComponent(redirectParam || '').trim();
        const isInternal = requested.startsWith('/');
        if (isInternal) {
            if (requested.startsWith('/admin') && !user?.isAdmin) return '/';
            return requested || '/';
        }
        return user?.isAdmin ? '/admin' : '/';
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                const { data } = await api.post('/users/auth/google', {
                    accessToken: tokenResponse.access_token
                });

                localStorage.setItem('userInfo', JSON.stringify(data));
                document.cookie = `accessToken=${data.accessToken || data.token}; path=/; max-age=2592000; SameSite=Strict`;
                document.cookie = `userInfo=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=2592000; SameSite=Strict`;
                
                window.dispatchEvent(new CustomEvent('userLogin', { detail: data }));
                toast.success(`مرحباً بك، ${data.name} 👋`);
                router.replace(computeTargetRoute(data));
            } catch (error) {
                toast.error(error.response?.data?.message || 'فشل الدخول عبر Google');
            } finally {
                setLoading(false);
            }
        },
        onError: () => toast.error('فشل الاتصال بحساب Google')
    });

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            router.replace('/');
        } else {
            setChecking(false);
        }
    }, [router]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!emailOrUsername.trim()) {
            newErrors.emailOrUsername = 'البريد الإلكتروني أو اسم المستخدم مطلوب';
        }
        
        if (!password) {
            newErrors.password = 'كلمة المرور مطلوبة';
        } else if (password.length < 6) {
            newErrors.password = 'كلمة المرور قصيرة جداً';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setLoading(true);

        try {
            const { data } = await api.post('/api/users/login', {
                emailOrUsername,
                password
            });

            localStorage.setItem('userInfo', JSON.stringify(data));
            
            const token = data.accessToken || data.token;
            
            // حفظ التوكن بشكل آمن للخادم والعميل
            document.cookie = `accessToken=${token}; path=/; max-age=2592000; SameSite=Strict; secure`;
            document.cookie = `userInfo=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=2592000; SameSite=Strict`;
            
            // تنبيه الخادم بالتوكن الجديد
            fetch('/api/auth/set-cookie', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            }).catch(err => console.error('خطأ في حفظ التوكن:', err));
            
            window.dispatchEvent(new CustomEvent('userLogin', { detail: data }));
            
            toast.success(`أهلاً بك مجدداً ${data.name} 🎉`);
            router.replace(computeTargetRoute(data));

        } catch (err) {
            console.error('Login Error:', err.response?.data || err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || 'فشل تسجيل الدخول - يرجى التحقق من البيانات';
            toast.error(errorMessage);
            
            // عرض تفاصيل إضافية في console للمطورين
            if (err.response?.status === 500) {
                console.error('Backend Error 500 - تحقق من لوجات الـ Backend');
            }
        } finally {
            setLoading(false);
        }
    };

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6" dir="rtl">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-10 border border-white"
            >
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        className="mx-auto mb-4 w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"
                    >
                        <LogIn size={36} />
                    </motion.div>
                    <h1 className="text-4xl font-black text-gray-800 tracking-tight">مرحباً بعودتك</h1>
                    <p className="text-gray-500 mt-2">سجل دخولك للمتابعة</p>
                </div>

                <form onSubmit={submitHandler} className="space-y-6">
                    <AnimatedInput
                        label="البريد الإلكتروني أو اسم المستخدم"
                        type="text"
                        name="emailOrUsername"
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        placeholder="example@email.com أو username"
                        error={errors.emailOrUsername}
                        icon={<AtSign size={20} />}
                        required
                    />

                    <AnimatedInput
                        label="كلمة المرور"
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        error={errors.password}
                        icon={<Lock size={20} />}
                        required
                    />

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => router.push('/forgot-password')}
                            className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
                        >
                            نسيت كلمة المرور؟
                        </button>
                    </div>

                    <AnimatedButton
                        type="submit"
                        variant="primary"
                        fullWidth
                        size="lg"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin ml-2" size={20} />
                                جاري تسجيل الدخول...
                            </>
                        ) : (
                            <>
                                <LogIn size={20} className="ml-2" />
                                تسجيل الدخول
                            </>
                        )}
                    </AnimatedButton>
                </form>

                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    <span className="text-gray-400 text-sm font-semibold">أو</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                </div>

                <AnimatedButton
                    onClick={() => googleLogin()}
                    variant="outline"
                    fullWidth
                    size="lg"
                    disabled={loading}
                >
                    <img
                        src="https://www.svgrepo.com/show/475656/google-color.svg"
                        className="w-5 h-5 ml-2"
                        alt="google"
                    />
                    الدخول عبر جوجل
                </AnimatedButton>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-8 text-gray-600"
                >
                    ليس لديك حساب؟{' '}
                    <button
                        onClick={() => router.push('/register')}
                        className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition-all"
                    >
                        إنشاء حساب جديد
                    </button>
                </motion.p>
            </motion.div>
        </div>
    );
}

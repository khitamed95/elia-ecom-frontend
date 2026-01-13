'use client';
import React, { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { UserPlus, User, Mail, Lock, Loader2 } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const router = useRouter();

    const googleRegister = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                const { data } = await api.post('/users/auth/google', {
                    accessToken: tokenResponse.access_token
                });
                
                // حفظ في localStorage
                localStorage.setItem('userInfo', JSON.stringify(data));
                
                // حفظ في Cookies للـ Server Components
                const token = data.accessToken || data.token;
                document.cookie = `accessToken=${token}; path=/; max-age=2592000; SameSite=Strict`;
                document.cookie = `userInfo=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=2592000; SameSite=Strict`;
                
                window.dispatchEvent(new CustomEvent('userLogin', { detail: data }));
                toast.success(`أهلاً بك، ${data.name}`);
                router.replace('/');
            } catch (error) {
                toast.error('فشل التسجيل عبر Google');
            } finally {
                setLoading(false);
            }
        }
    });

    const validatePassword = (pwd) => {
        const rules = [
            { regex: /.{8,}/, message: '8 أحرف' },
            { regex: /[A-Z]/, message: 'حرف كبير' },
            { regex: /[0-9]/, message: 'رقم' },
        ];
        const failed = rules.find(r => !r.regex.test(pwd));
        return failed ? `تحتاج إلى: ${failed.message}` : '';
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const pwdErr = validatePassword(password);
        if (pwdErr) return setPasswordError(pwdErr);
        setPasswordError('');

        if (!phone || phone.length < 10) return toast.error('رقم هاتف غير صحيح');

        setLoading(true);
        try {
            // Use the canonical user registration endpoint
            console.log('🔄 محاولة: POST /users/register');
            const response = await api.post('/users/register', { name, email, phone, password });
            const data = response.data;
            console.log('✅ نجح الـ endpoint: /users/register', data);
            
            // حفظ في localStorage
            localStorage.setItem('userInfo', JSON.stringify(data));
            
            // حفظ في Cookies للـ Server Components
            const token = data.accessToken || data.token;
            document.cookie = `accessToken=${token}; path=/; max-age=2592000; SameSite=Strict`;
            document.cookie = `userInfo=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=2592000; SameSite=Strict`;
            
            window.dispatchEvent(new CustomEvent('userLogin', { detail: data }));
            toast.success('تم إنشاء الحساب بنجاح');
            router.replace('/');
        } catch (err) {
            console.error('❌ تفاصيل الخطأ:', {
                message: err.message,
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                url: err.config?.url,
                method: err.config?.method
            });
            let errorMessage = 'فشل التسجيل';
            if (err.response?.status === 0 || err.message === 'Network Error') {
                errorMessage = 'لا يمكن الاتصال بالسيرفر. تأكد من تشغيل Backend';
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.status === 404) {
                errorMessage = 'المسار غير موجود في السيرفر';
            }
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6" dir="rtl">
            <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 border border-gray-100 animate-in fade-in duration-500">
                <div className="text-center mb-10">
                    <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-100">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tighter">انضم إلينا</h1>
                </div>

                <form onSubmit={submitHandler} className="space-y-4">
                    <div className="relative group">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input type="text" placeholder="الاسم الكامل" className="w-full pr-12 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600/20 font-bold" value={name} onChange={(e)=>setName(e.target.value)} required />
                    </div>
                    <div className="relative group">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input type="email" placeholder="البريد الإلكتروني" className="w-full pr-12 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600/20 font-bold" value={email} onChange={(e)=>setEmail(e.target.value)} required />
                    </div>
                    <div className="relative" dir="ltr">
                        <PhoneInput
                            country={'iq'}
                            value={phone}
                            onChange={(value) => setPhone(value)}
                            inputStyle={{ width: '100%', height: '60px', borderRadius: '1rem', backgroundColor: '#f9fafb', border: 'none', fontWeight: 'bold' }}
                            buttonStyle={{ borderRadius: '1rem 0 0 1rem', border: 'none', backgroundColor: '#f9fafb' }}
                        />
                    </div>
                    <div className="relative group">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                        <input type="password" placeholder="كلمة المرور" className="w-full pr-12 py-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-600/20 font-bold" value={password} onChange={(e)=>setPassword(e.target.value)} required />
                        {passwordError && <p className="text-[10px] text-red-500 mt-1 font-black">{passwordError}</p>}
                    </div>

                    <button disabled={loading} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black mt-6 hover:bg-black shadow-xl transition-all flex items-center justify-center gap-3">
                        {loading ? <Loader2 className="animate-spin" /> : 'إنشاء حساب جديد'}
                    </button>
                </form>

                <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-gray-100"></div>
                    <span className="text-gray-300 text-xs font-bold">أو</span>
                    <div className="flex-1 h-px bg-gray-100"></div>
                </div>

                <button onClick={() => googleRegister()} className="w-full bg-white border border-gray-200 text-gray-600 py-4 rounded-2xl font-bold flex items-center justify-center gap-3">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="google" />
                    عبر جوجل
                </button>

                <p className="text-center mt-10 text-gray-400 text-sm">
                    لديك حساب؟ 
                    <button onClick={() => router.push('/login')} className="text-indigo-600 font-black mr-2 hover:underline">سجل دخولك</button>
                </p>
            </div>
        </div>
    );
}
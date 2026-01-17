'use client';
import React, { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import Button from '@/components/Button';
import { UserPlus, User, Mail, Lock, Phone } from 'lucide-react';
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
                const { data } = await api.post('/users/auth/google', {
                    accessToken: tokenResponse.access_token
                });
                
                localStorage.setItem('userInfo', JSON.stringify(data));
                window.dispatchEvent(new CustomEvent('userLogin', { detail: data }));
                toast.success(`مرحباً ${data.name}`);
                setTimeout(() => {
                    router.replace('/');
                }, 100);
            } catch (error) {
                toast.error('فشل التسجيل عبر Google');
            }
        },
        onError: () => {
            toast.error('فشل التسجيل عبر Google');
        }
    });

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

    // تحقق من صيغة رقم الهاتف (+964 أو 964)
    const validatePhone = (phoneNum) => {
        const cleanPhone = phoneNum.replace(/\D/g, '');
        if (!cleanPhone || cleanPhone.length < 10) {
            return 'يرجى إدخال رقم هاتف صحيح (10 أرقام على الأقل)';
        }
        if (!cleanPhone.startsWith('964')) {
            return 'يجب أن يبدأ رقم الهاتف برمز الدولة 964 (العراق)';
        }
        return '';
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const pwdErr = validatePassword(password);
        if (pwdErr) {
            setPasswordError(pwdErr);
            return;
        }
        setPasswordError('');
        const phoneErr = validatePhone(phone);
        if (phoneErr) {
            toast.error(phoneErr);
            return;
        }
        setLoading(true);
        try {
            // إرسال البيانات للخادم
            const registerData = { name, email, password };
            
            // إضافة رقم الهاتف فقط إذا كان موجوداً
            if (phone && phone.trim()) {
                registerData.phone = phone;
            }
            
            const { data } = await api.post('/api/users/register', registerData);
            
            // حفظ بيانات المستخدم
            localStorage.setItem('userInfo', JSON.stringify(data));
            
            const token = data.accessToken || data.token;
            if (token) {
                // حفظ التوكن للخادم
                fetch('/api/auth/set-cookie', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token })
                }).catch(err => console.error('خطأ في حفظ التوكن:', err));
            }
            
            window.dispatchEvent(new CustomEvent('userLogin', { detail: data }));
            toast.success('تم إنشاء حسابك بنجاح');
            setTimeout(() => {
                router.replace('/');
            }, 100);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.response?.data?.error || 'فشل في إنشاء الحساب';
            toast.error(errorMsg);
            console.error('خطأ في التسجيل:', err.response?.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6" dir="rtl">
            <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-10 border border-gray-100">
                <div className="text-center mb-10">
                    <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-green-100">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-800">حساب جديد</h1>
                    <p className="text-gray-400 mt-2">انضم لمجتمع ELIA الحصري</p>
                </div>

                <form onSubmit={submitHandler} className="space-y-5">
                    <div className="relative border-b-2 border-gray-50 pb-2">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input type="text" placeholder="الاسم الكامل" className="w-full pr-12 py-3 outline-none" value={name} onChange={(e)=>setName(e.target.value)} required />
                    </div>
                    <div className="relative border-b-2 border-gray-50 pb-2">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input type="email" placeholder="البريد الإلكتروني" className="w-full pr-12 py-3 outline-none" value={email} onChange={(e)=>setEmail(e.target.value)} required />
                    </div>
                    <div className="relative border-b-2 border-gray-50 pb-2">
                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input 
                            type="tel" 
                            placeholder="+964 أو 964 متبوعاً بالأرقام" 
                            className="w-full pr-12 py-3 outline-none" 
                            value={phone} 
                            onChange={(e)=>setPhone(e.target.value)} 
                            required 
                            dir="ltr"
                        />
                    </div>
                    <div className="relative border-b-2 border-gray-50 pb-2">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                        <input 
                            type="password" 
                            placeholder="كلمة المرور (8+ أحرف، كابتل، سمول، رقم، رمز)" 
                            className="w-full pr-12 py-3 outline-none" 
                            value={password} 
                            onChange={(e)=>setPassword(e.target.value)} 
                            required 
                        />
                        {passwordError && <div className="text-xs text-red-600 mt-1 font-bold">{passwordError}</div>}
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 mb-2">
                        <p className="text-xs text-blue-800 font-bold mb-1">شروط كلمة المرور:</p>
                        <ul className="text-xs text-blue-700 space-y-1 mr-4 list-disc">
                            <li>8 أحرف على الأقل</li>
                            <li>حرف كبير (A-Z)</li>
                            <li>حرف صغير (a-z)</li>
                            <li>رقم (0-9)</li>
                            <li>رمز خاص (!@#$...)</li>
                        </ul>
                    </div>
                    <Button
                        disabled={loading}
                        variant="success"
                        size="lg"
                        type="submit"
                        loading={loading}
                        className="w-full mt-6"
                    >
                        إنشاء الحساب
                    </Button>
                </form>

                {/* خط فاصل */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-gray-400 text-sm">أو</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                </div>

                {/* زر Google */}
                <Button 
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => googleRegister()}
                    className="w-full"
                >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    التسجيل عبر Google
                </Button>

                <p className="text-center mt-8 text-gray-500">لديك حساب بالفعل؟ <span className="text-green-600 font-bold cursor-pointer hover:underline" onClick={() => router.push('/login')}>سجل دخولك</span></p>
            </div>
        </div>
    );
}
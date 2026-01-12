'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    User, 
    Camera, 
    Mail, 
    Save, 
    Loader2, 
    ArrowRight,
    ShieldCheck,
    LogOut
} from 'lucide-react';
import { toast } from 'react-toastify';
import { updateUserProfile } from '@/app/actions';

export default function ProfileClient({ initialUser }) {
    const router = useRouter();
    const [updateLoading, setUpdateLoading] = useState(false);
    const [name, setName] = useState(initialUser?.name || '');
    const [email, setEmail] = useState(initialUser?.email || '');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(initialUser?.avatar || '');
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        if (image) {
            formData.append('avatar', image);
        }

        try {
            const data = await updateUserProfile(formData);
            
            // تحديث بيانات localStorage
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const updatedUserInfo = { 
                ...userInfo, 
                name: data.name, 
                email: data.email || email,
                avatar: data.avatar,
                id: data.id || userInfo.id,
                isAdmin: data.isAdmin !== undefined ? data.isAdmin : userInfo.isAdmin,
                token: userInfo.token || userInfo.accessToken,
                accessToken: userInfo.accessToken || userInfo.token
            };
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));

            window.dispatchEvent(new CustomEvent('userLogin'));
            
            toast.success('تم تحديث بروفايلك بنجاح ✨');
            
            setTimeout(() => {
                router.push('/');
            }, 1000);
        } catch (err) {
            toast.error(err.message || 'فشل التحديث');
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleLogout = () => {
        // حذف من localStorage
        localStorage.clear();
        
        // حذف من Cookies
        document.cookie = 'accessToken=; path=/; max-age=0';
        document.cookie = 'userInfo=; path=/; max-age=0';
        
        router.push('/login');
    };

    return (
        <>
            <button 
                onClick={() => router.back()} 
                className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 mb-8 font-bold transition-all"
            >
                <ArrowRight size={20} /> العودة للمتجر
            </button>

            <div className="bg-white rounded-[3.5rem] shadow-xl border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600 relative"></div>
                
                <form onSubmit={submitHandler} className="p-8 md:p-12 -mt-16 relative">
                    {/* Profile Image Section */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-gray-200">
                                {preview ? (
                                    <img 
                                        src={preview.startsWith('http') ? preview : `${API_URL}${preview}`} 
                                        className="w-full h-full object-cover" 
                                        alt="Profile" 
                                        onError={(e) => {
                                            e.target.src = '';
                                        }}
                                    />
                                ) : (
                                    <User className="w-full h-full p-6 text-gray-400" />
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 bg-black text-white p-3 rounded-2xl cursor-pointer hover:bg-indigo-600 transition-all shadow-lg">
                                <Camera size={20} />
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    onChange={handleImageChange} 
                                    accept="image/*" 
                                />
                            </label>
                        </div>
                        <h2 className="mt-4 text-2xl font-black text-gray-800">{name}</h2>
                        <p className="text-gray-500 font-medium text-sm italic">{email}</p>
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
                                className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold outline-none text-left text-gray-400"
                                dir="ltr"
                                disabled
                            />
                        </div>
                    </div>

                    <div className="mt-10 flex flex-col gap-4">
                        <button 
                            type="submit" 
                            disabled={updateLoading}
                            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center justify-center gap-3 transition-all disabled:opacity-50"
                        >
                            {updateLoading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <Save size={24} />
                            )}
                            حفظ التغييرات الحالية
                        </button>

                        <button 
                            type="button"
                            onClick={handleLogout}
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
        </>
    );
}

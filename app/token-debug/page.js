'use client';

import React, { useState } from 'react';
import { RefreshCw, Trash2, Eye, LogOut } from 'lucide-react';
import { authDebug } from '@/lib/auth-debug';
import api from '@/lib/axios';
import { toast } from 'react-toastify';

export default function TokenDebugPage() {
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const showTokenInfo = () => {
        const info = authDebug.showTokenInfo();
        setUserInfo(info);
        toast.info('تم عرض معلومات التوكن في الـ Console');
    };

    const expireToken = () => {
        authDebug.expireToken();
        const info = authDebug.showTokenInfo();
        setUserInfo(info);
        toast.warning('تم تعطيل التوكن - جرب طلب API الآن لاختبار التحديث التلقائي');
    };

    const testRefreshManually = async () => {
        setLoading(true);
        try {
            console.log('🔄 محاولة تحديث التوكن يدويًا...');
            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
            
            const response = await api.post('/users/refresh-token', {
                refreshToken: userInfo.refreshToken
            });
            
            console.log('✅ تم التحديث بنجاح:', response.data);
            toast.success('تم تحديث التوكن بنجاح!');
            
            const updatedInfo = authDebug.showTokenInfo();
            setUserInfo(updatedInfo);
        } catch (error) {
            console.error('❌ فشل التحديث:', error.response?.data || error.message);
            toast.error('فشل تحديث التوكن: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const testApiCall = async () => {
        setLoading(true);
        try {
            console.log('🌐 محاولة استدعاء API محمي...');
            // جرب أي endpoint محمي - هنا نحاول جلب بيانات المستخدم
            const response = await api.get('/users/profile');
            console.log('✅ استدعاء API نجح:', response.data);
            toast.success('نجح استدعاء API المحمي!');
        } catch (error) {
            console.error('❌ فشل استدعاء API:', error.response?.data || error.message);
            
            if (error.response?.status === 401) {
                toast.error('401: الجلسة منتهية - سيتم التحديث تلقائياً');
            } else {
                toast.error('فشل استدعاء API: ' + (error.response?.data?.message || error.message));
            }
        } finally {
            setLoading(false);
        }
    };

    const clearAllData = () => {
        if (confirm('هل أنت متأكد من رغبتك في حذف جميع بيانات المستخدم؟')) {
            authDebug.clearAllData();
            setUserInfo(null);
            toast.success('تم حذف جميع البيانات - سيتم توجيهك للوجن');
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-6" dir="rtl">
            <h1 className="text-3xl font-black mb-8">🛠️ أداة تصحيح التوكن والجلسات</h1>
            
            {/* معلومات التوكن الحالية */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 mb-8">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                    <Eye size={24} /> معلومات الجلسة الحالية
                </h2>
                
                {userInfo ? (
                    <div className="space-y-3 text-sm">
                        <p><strong>معرف المستخدم:</strong> {userInfo?.id || '❌ غير متوفر'}</p>
                        <p><strong>البريد الإلكتروني:</strong> {userInfo?.email || '❌ غير متوفر'}</p>
                        <p><strong>الاسم:</strong> {userInfo?.name || '❌ غير متوفر'}</p>
                        <p><strong>التوكن الموجود:</strong> {userInfo?.accessToken ? '✅ نعم' : '❌ لا'}</p>
                        <p><strong>طول التوكن:</strong> {userInfo?.accessToken?.length || 0} حرف</p>
                        <p><strong>التوكن (الـ 50 حرف الأول):</strong> <code className="bg-gray-200 p-2 rounded text-xs">{userInfo?.accessToken?.substring(0, 50)}...</code></p>
                    </div>
                ) : (
                    <p className="text-center text-gray-600 py-4">اضغط على "عرض معلومات التوكن" لعرض البيانات</p>
                )}
            </div>

            {/* الأزرار */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
                <button
                    onClick={showTokenInfo}
                    disabled={loading}
                    className="bg-blue-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 justify-center"
                >
                    <Eye size={20} /> عرض معلومات التوكن
                </button>

                <button
                    onClick={expireToken}
                    disabled={loading}
                    className="bg-orange-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-orange-700 disabled:bg-gray-400 flex items-center gap-2 justify-center"
                >
                    ⏰ تعطيل التوكن (للاختبار)
                </button>

                <button
                    onClick={testRefreshManually}
                    disabled={loading}
                    className="bg-green-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2 justify-center"
                >
                    <RefreshCw size={20} /> {loading ? 'جاري التحديث...' : 'تحديث التوكن يدويًا'}
                </button>

                <button
                    onClick={testApiCall}
                    disabled={loading}
                    className="bg-purple-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-purple-700 disabled:bg-gray-400 flex items-center gap-2 justify-center"
                >
                    🌐 اختبار API محمي
                </button>

                <button
                    onClick={clearAllData}
                    disabled={loading}
                    className="bg-red-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-400 flex items-center gap-2 justify-center col-span-2"
                >
                    <Trash2 size={20} /> حذف جميع البيانات والخروج
                </button>
            </div>

            {/* التعليمات */}
            <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-200">
                <h3 className="text-xl font-black mb-6">📋 خطوات الاختبار:</h3>
                <ol className="space-y-4 text-sm">
                    <li><strong>1. عرض البيانات:</strong> اضغط "عرض معلومات التوكن" لترى التوكن الحالي</li>
                    <li><strong>2. تعطيل التوكن:</strong> اضغط "تعطيل التوكن" لمحاكاة انتهاء الجلسة</li>
                    <li><strong>3. الاختبار التلقائي:</strong> اضغط "اختبار API محمي" - يجب أن يحدث التوكن تلقائياً</li>
                    <li><strong>4. الاختبار اليدوي:</strong> اضغط "تحديث التوكن يدويًا" لاختبار endpoint التحديث</li>
                    <li><strong>5. تفتيش الـ Console:</strong> افتح DevTools (F12) وشاهد السجلات بالتفصيل</li>
                </ol>
            </div>

            {/* رابط العودة */}
            <div className="mt-8 text-center">
                <a href="/" className="text-indigo-600 font-bold hover:underline">
                    ← العودة للصفحة الرئيسية
                </a>
            </div>
        </div>
    );
}

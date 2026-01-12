'use client';

import React, { useState } from 'react';
import api from '@/lib/axios';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ContactPage() {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        setLoading(true);
        const form = e.target;
        const name = form.querySelector('input[type="text"]').value;
        const phone = form.querySelector('input[type="tel"]').value;
        const subject = form.querySelectorAll('input[type="text"]')[1].value;
        const message = form.querySelector('textarea').value;
        
        // التحقق من أن رقم الهاتف يحتوي على أرقام فقط
        const phoneRegex = /^[0-9]+$/;
        if (!phoneRegex.test(phone)) {
            toast.error('رقم الهاتف يجب أن يحتوي على أرقام فقط');
            setLoading(false);
            return;
        }
        
        // التحقق من أن رقم الهاتف 10 أرقام على الأقل
        if (phone.length < 10) {
            toast.error('رقم الهاتف يجب أن يكون 10 أرقام على الأقل');
            setLoading(false);
            return;
        }
        
        // التحقق من الحقول
        if (!name || !phone || !subject || !message) {
            toast.error('يرجى ملء جميع الحقول');
            setLoading(false);
            return;
        }
        
        const contactData = { name, phone, subject, message };
        console.log('📤 البيانات المرسلة:', contactData);
        
        try {
            // استخدام axios API الذي يرسل التوكن تلقائياً
            const { data } = await api.post('/contact', contactData);
            
            console.log('✅ تم إرسال الرسالة:', data);
            toast.success('تم إرسال رسالتك بنجاح! سيتواصل معك فريق إيليا قريباً.');
            form.reset();
        } catch (error) {
            console.error('❌ خطأ في الإرسال:', error.message);
            toast.error(error.response?.data?.message || error.message || 'حدث خطأ أثناء إرسال الرسالة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] py-20 px-6 font-sans" dir="rtl">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-black text-gray-900 mb-4">تواصل معنا</h1>
                    <p className="text-gray-500 font-bold text-lg">نحن هنا للإجابة على استفساراتك ومساعدتك في أي وقت.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* معلومات التواصل */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                            <div className="flex items-center gap-5 mb-6">
                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-black uppercase">اتصل بنا</p>
                                    <p className="font-black text-gray-800" dir="ltr">0770 000 0000</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-5 mb-6">
                                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                                    <MessageCircle size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-black uppercase">واتساب</p>
                                    <p className="font-black text-gray-800" dir="ltr">0780 000 0000</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-black uppercase">البريد الإلكتروني</p>
                                    <p className="font-black text-gray-800">info@elia-store.com</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl">
                            <div className="flex items-center gap-4 mb-4">
                                <Clock size={24} />
                                <h3 className="font-black text-xl">ساعات العمل</h3>
                            </div>
                            <p className="text-indigo-100 text-sm font-bold leading-relaxed">
                                طيلة أيام الأسبوع<br />
                                من الساعة 10:00 صباحاً - 11:00 مساءً
                            </p>
                        </div>
                    </div>

                    {/* نموذج المراسلة */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white p-10 md:p-12 rounded-[3rem] shadow-sm border border-gray-100 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 mr-2 uppercase">الاسم الكامل</label>
                                    <input required type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 mr-2 uppercase">رقم الهاتف</label>
                                    <input 
                                        required 
                                        type="tel" 
                                        inputMode="numeric" 
                                        placeholder="0770000000" 
                                        onKeyPress={(e) => {
                                            if (!/[0-9]/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onPaste={(e) => {
                                            const pastedText = e.clipboardData.getData('text');
                                            if (!/^[0-9]+$/.test(pastedText)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold transition-all" 
                                        dir="ltr" 
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 mr-2 uppercase">عنوان الرسالة</label>
                                <input required type="text" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 mr-2 uppercase">رسالتك</label>
                                <textarea required rows="5" className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 outline-none font-bold transition-all resize-none"></textarea>
                            </div>
                            <button 
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-black shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3"
                            >
                                {loading ? 'جاري الإرسال...' : <><Send size={20} /> إرسال الرسالة</>}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
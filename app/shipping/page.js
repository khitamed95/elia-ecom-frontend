'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { MapPin, User, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function ShippingPage() {
    const router = useRouter();
    const { cartItems } = useCart();
    const [phone, setPhone] = useState('');
    const [shippingAddress, setShippingAddress] = useState({
        fullName: '',
        city: 'بغداد',
        area: '',
        street: '',
        building: '',
        notes: ''
    });

    useEffect(() => {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (!storedUserInfo) {
            router.push('/login?redirect=shipping');
            return;
        }
        
        if (!cartItems || cartItems.length === 0) {
            router.push('/cart');
            return;
        }

        const savedAddress = localStorage.getItem('shippingAddress');
        if (savedAddress) {
            const parsed = JSON.parse(savedAddress);
            setShippingAddress(parsed);
            setPhone(parsed.phone || '');
        } else {
            setShippingAddress(prev => ({
                ...prev,
                fullName: JSON.parse(storedUserInfo).name
            }));
        }
    }, [router, cartItems]);

    const submitHandler = (e) => {
        e.preventDefault();
        if (phone.length < 10) {
            toast.error('يرجى إدخال رقم هاتف صحيح');
            return;
        }
        
        const addressToSave = { ...shippingAddress, phone };
        localStorage.setItem('shippingAddress', JSON.stringify(addressToSave));
        toast.success('تم حفظ العنوان');
        router.push('/payment');
    };

    const cities = ['بغداد', 'البصرة', 'أربيل', 'النجف', 'كربلاء', 'بابل', 'ديالى', 'الأنبار', 'ذي قار', 'المثنى', 'القادسية', 'صلاح الدين', 'واسط', 'ميسان', 'السليمانية', 'دهوك', 'كركوك', 'نينوى'];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6" dir="rtl">
            <div className="max-w-3xl mx-auto">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 mb-8 font-bold">
                    <ArrowRight size={20} /> العودة للسلة
                </button>

                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-gray-100">
                    <h1 className="text-3xl font-black text-gray-800 mb-8">عنوان التوصيل</h1>
                    <form onSubmit={submitHandler} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-500 mr-2">الاسم الكامل *</label>
                            <input type="text" value={shippingAddress.fullName} onChange={(e) => setShippingAddress({...shippingAddress, fullName: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none border-2 focus:border-indigo-500 font-bold" required />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 mr-2">رقم الهاتف *</label>
                            <div dir="ltr">
                                <PhoneInput country={'iq'} value={phone} onChange={setPhone} inputStyle={{ width: '100%', height: '55px', borderRadius: '16px', fontSize: '18px', fontWeight: 'bold' }} />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-500 mr-2">المحافظة *</label>
                                <select value={shippingAddress.city} onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold cursor-pointer" required>
                                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-500 mr-2">المنطقة / الحي *</label>
                                <input type="text" value={shippingAddress.area} onChange={(e) => setShippingAddress({...shippingAddress, area: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" required />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-500 mr-2">الشارع *</label>
                                <input type="text" value={shippingAddress.street} onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-500 mr-2">رقم البناية (اختياري)</label>
                                <input type="text" value={shippingAddress.building} onChange={(e) => setShippingAddress({...shippingAddress, building: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold" />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3">
                            المتابعة إلى الدفع <ArrowLeft size={24} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
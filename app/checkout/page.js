'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext'; // تأكد من أن المسار يؤدي إلى CartContext المحدث
import api from '@/lib/axios';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import {
    MapPin, 
    Phone, 
    User, 
    Truck, 
    CheckCircle2, 
    ArrowRight, 
    Loader2,
    ShieldCheck,
    ShoppingBag
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function CheckoutPage() {
    const [phone, setPhone] = useState('');
    const router = useRouter();
    const { cartItems, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [storeSettings, setStoreSettings] = useState({ 
        deliveryBaghdad: 5000, 
        deliveryProvinces: 8000 
    });

    const [formData, setFormData] = useState({
        fullName: '',
        phoneNumber: '',
        city: 'بغداد',
        address: '',
        paymentMethod: 'الدفع عند الاستلام'
    });

    // لضمان التوافق مع Next.js وتفادي مشاكل الـ Hydration
    useEffect(() => {
        setIsMounted(true);
        const fetchSettings = async () => {
            try {
                const { data } = await api.get('/settings');
                if (data) setStoreSettings(data);
            } catch (error) {
                console.error('استخدام قيم التوصيل الافتراضية');
            }
        };
        fetchSettings();
    }, []);

    // الحسابات المالية
    const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const deliveryPrice = formData.city === 'بغداد' ? storeSettings.deliveryBaghdad : storeSettings.deliveryProvinces;
    const totalPrice = itemsPrice + deliveryPrice;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (cartItems.length === 0) {
            toast.error('سلتك فارغة!');
            return;
        }

        // تطبيع عناصر السلة: استخراج المعرّف وتحويله إلى رقم وإسقاط العناصر غير الصالحة
        const normalizedOrderItems = cartItems
            .map(item => {
                const pidRaw = item.productId || item.id || item._id || item?.product?.id;
                const pid = Number(pidRaw);
                if (!pid || Number.isNaN(pid)) return null;
                return {
                    productId: pid,
                    name: item.name,
                    qty: Number(item.qty) || 1,
                    image: item.image,
                    price: Number(item.price) || 0,
                    size: item.size || 'N/A',
                    color: item.color || 'N/A'
                };
            })
            .filter(Boolean);

        if (normalizedOrderItems.length !== cartItems.length) {
            const dropped = cartItems.length - normalizedOrderItems.length;
            toast.warning(`تم تجاهل ${dropped} منتج بدون معرّف صالح.`);
        }
        if (normalizedOrderItems.length === 0) {
            toast.error('لا توجد عناصر صالحة في السلة.');
            return;
        }
        
        // تجهيز البيانات للهيكلية التي يتوقعها الباك إند (Prisma)
        const orderData = {
            phone: formData.phoneNumber,
            itemsPrice: Number(itemsPrice),
            shippingPrice: Number(deliveryPrice),
            totalPrice: Number(totalPrice),
            paymentMethod: formData.paymentMethod,
            shippingAddress: {
                address: formData.address,
                city: formData.city,
                country: 'Iraq'
            },
            // تحويل عناصر السلة إلى OrderItems مطابقة للـ Schema
            orderItems: normalizedOrderItems
        };

        // إذا اختار المستخدم الدفع بالبطاقة، نوجهه لصفحة الدفع
        if (formData.paymentMethod === 'بطاقة ائتمان') {
            // حفظ بيانات الطلب مؤقتاً في localStorage
            localStorage.setItem('pendingOrder', JSON.stringify(orderData));
            // التوجه لصفحة الدفع بالبطاقة
            router.push('/card-payment');
            return;
        }

        // إذا كان الدفع عند الاستلام، نرسل الطلب مباشرة
        setLoading(true);
        try {
            // لوج مفيد لتشخيص الأخطاء 400
            console.log('Order Data Payload →', orderData);

            // إرسال الطلب
            const { data } = await api.post('/orders', orderData);
            
            // حفظ رقم الطلب لعرضه لاحقاً
            localStorage.setItem('lastOrderId', data.id);
            
            toast.success(`✅ تم تسجيل طلبك بنجاح! رقم الطلب: #${data.id}`, {
                position: "top-center",
                autoClose: 5000,
                hideProgressBar: false,
            });
            
            // تفريغ السلة بعد النجاح
            clearCart(); 
            
            // التوجه لصفحة النجاح مع رقم الطلب
            setTimeout(() => {
                router.push(`/order-success/${data.id}`);
            }, 1500); 
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'حدث خطأ في البيانات المرسلة (400)';
            toast.error(errorMsg);
            console.error('تفاصيل الخطأ:', error.response?.data);
            if (error.response?.data) {
                try {
                    const details = JSON.stringify(error.response.data, null, 2);
                    console.log('تفاصيل كاملة (JSON):', details);
                } catch {}
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) return null;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] p-6 text-center">
                <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-gray-100 max-w-md w-full">
                    <ShoppingBag size={80} className="mx-auto text-indigo-100 mb-6" />
                    <h2 className="text-2xl font-black text-gray-800 mb-2">حقيبتك فارغة</h2>
                    <p className="text-gray-400 font-bold mb-8 text-sm">لم تقم بإضافة أي ملابس إلى سلتك بعد.</p>
                    <button onClick={() => router.push('/')} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-black transition-all">
                        ابدأ التسوق الآن
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans" dir="rtl">
            <div className="max-w-6xl mx-auto">
                {/* زر العودة */}
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 mb-10 font-black transition-all group">
                    <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" /> العودة للسلة
                </button>

                <div className="grid lg:grid-cols-2 gap-12">
                    
                    {/* معلومات الزبون (الشحن) */}
                    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                        <h2 className="text-3xl font-black text-gray-900 mb-10 flex items-center gap-4">
                            <Truck className="text-indigo-600" size={32} /> معلومات التوصيل
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 mr-2 flex items-center gap-2 uppercase tracking-widest">
                                    <User size={14} className="text-indigo-500" /> الاسم الكامل
                                </label>
                                <input 
                                    type="text" required
                                    placeholder="اكتب اسمك الثلاثي لضمان وصول الطلب"
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none font-bold transition-all placeholder:text-gray-300"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 mr-2 flex items-center gap-2 uppercase tracking-widest">
                                    <Phone size={14} className="text-indigo-500" /> رقم الهاتف
                                </label>
                                <input 
                                    type="tel" required
                                    placeholder="07XXXXXXXXX"
                                    className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none font-bold text-left tracking-widest" dir="ltr"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-400 mr-2 uppercase tracking-widest">المحافظة</label>
                                    <select 
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none font-bold appearance-none cursor-pointer transition-all"
                                        value={formData.city}
                                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                                    >
                                        <option value="بغداد">بغداد</option>
                                        <option value="البصرة">البصرة</option>
                                        <option value="أربيل">أربيل</option>
                                        <option value="الموصل">الموصل</option>
                                        <option value="بابل">بابل</option>
                                        <option value="النجف">النجف</option>
                                        <option value="كربلاء">كربلاء</option>
                                        <option value="محافظة أخرى">باقي المحافظات</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-400 mr-2 uppercase tracking-widest">العنوان بالتفصيل</label>
                                    <input 
                                        required
                                        placeholder="المنطقة، أقرب نقطة دالة"
                                        className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-indigo-600 focus:bg-white outline-none font-bold transition-all"
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* خيارات طريقة الدفع */}
                            <div className="space-y-3">
                                <label className="text-xs font-black text-gray-400 mr-2 uppercase tracking-widest">طريقة الدفع</label>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            value="الدفع عند الاستلام" 
                                            checked={formData.paymentMethod === 'الدفع عند الاستلام'}
                                            onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                                            className="w-5 h-5 text-green-600"
                                        />
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                                <ShieldCheck size={20} className="text-green-600" />
                                            </div>
                                            <div>
                                                <span className="font-black text-gray-800">الدفع عند الاستلام</span>
                                                <p className="text-[10px] text-gray-500 font-bold">ادفع نقداً عند استلام الطلب</p>
                                            </div>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 p-4 border-2 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50">
                                        <input 
                                            type="radio" 
                                            name="payment" 
                                            value="بطاقة ائتمان" 
                                            checked={formData.paymentMethod === 'بطاقة ائتمان'}
                                            onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                                            className="w-5 h-5 text-indigo-600"
                                        />
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                                <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                                                </svg>
                                            </div>
                                            <div>
                                                <span className="font-black text-gray-800">بطاقة ائتمان</span>
                                                <p className="text-[10px] text-gray-500 font-bold">Visa / Mastercard</p>
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* شارة الدفع */}
                            <div className="p-6 bg-green-50 rounded-[2.5rem] border border-green-100 flex items-center gap-5">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm shrink-0">
                                    <ShieldCheck size={28} />
                                </div>
                                <div>
                                    <p className="font-black text-green-900 text-sm italic">نظام الدفع الآمن</p>
                                    <p className="text-[10px] text-green-700 font-bold uppercase">الدفع عند الاستلام متوفر لجميع محافظات العراق</p>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gray-900 text-white py-6 rounded-[2.5rem] font-black text-xl hover:bg-black shadow-2xl shadow-indigo-100 flex items-center justify-center gap-4 transition-all active:scale-[0.98] disabled:bg-gray-200"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
                                تأكيد الطلب النهائي
                            </button>
                        </form>
                    </div>

                    {/* ملخص الفاتورة */}
                    <div className="lg:sticky lg:top-12 h-fit">
                        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
                            <h3 className="text-xl font-black text-gray-900 mb-10 border-b border-gray-50 pb-6 italic">ملخص طلبك</h3>
                            
                            <div className="space-y-6 mb-10 max-h-[350px] overflow-y-auto no-scrollbar pr-2">
                                {cartItems.map((item, i) => (
                                    <div key={item.cartKey || i} className="flex justify-between items-center group">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0 shadow-inner">
                                                <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-800 line-clamp-1">{item.name}</p>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                                                    {item.color} | {(item.category?.toLowerCase() || '').includes('حذاء') ? `مقاس ${item.size}` : item.size} | {item.qty} قطعة
                                                </p>
                                            </div>
                                        </div>
                                        <span className="font-black text-gray-700 whitespace-nowrap">{(item.price * item.qty).toLocaleString()} د.ع</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="space-y-5 pt-8 border-t border-gray-50">
                                <div className="flex justify-between text-gray-400 font-black text-sm">
                                    <span>مجموع القطع</span>
                                    <span>{itemsPrice.toLocaleString()} د.ع</span>
                                </div>
                                <div className="flex justify-between text-gray-400 font-black text-sm">
                                    <span className="flex items-center gap-2">أجور التوصيل <Truck size={14} className="text-indigo-400"/></span>
                                    <span>{deliveryPrice.toLocaleString()} د.ع</span>
                                </div>
                                <div className="flex justify-between items-center pt-8 text-3xl font-black text-indigo-600">
                                    <span>الإجمالي</span>
                                    <span className="tracking-tighter">{totalPrice.toLocaleString()} د.ع</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-8 text-center text-gray-300 font-black text-[10px] uppercase tracking-[0.2em]">
                            ELIA Security Checkout | 2025
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
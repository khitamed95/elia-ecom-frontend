'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { isValidSession, getCurrentUser } from '@/lib/auth-helper';
import { toast } from 'react-toastify';
import { 
  Users, 
  Package, 
  PlusCircle, 
  LayoutDashboard, 
  TrendingUp, 
  Bell, 
  Settings, 
  ShoppingBag,
  ArrowUpRight,
  ShieldCheck,
  Loader2,
  AlertCircle,
  MessageSquare
} from 'lucide-react';

export default function AdminMainPage() {
    const router = useRouter();
    const [stats, setStats] = useState({ 
        users: { total: 0, regular: 0, admins: 0 }, 
        sales: { totalOrders: 0, totalRevenue: 0 } 
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checking, setChecking] = useState(true);

    // 1. التحقق من صلاحيات الأدمن وحماية المسار
    useEffect(() => {
        // التحقق من الجلسة
        if (!isValidSession()) {
            toast.error('يجب تسجيل الدخول أولاً');
            router.push('/login?redirect=/admin');
            return;
        }
        
        const user = getCurrentUser();
       if (!isValidSession() || user?.isAdmin !== true) {
            toast.error('ليس لديك صلاحية الوصول لوحة التحكم');
            router.replace('/'); 
            return;
        }
        setChecking(false);
    }, [router]);

    // 2. جلب الإحصائيات الموحدة من الباك إند
   useEffect(() => {
        if (checking) return;
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/stats');
                setStats(data);
            } catch (err) {
                // إذا حصل خطأ 403، قد تكون الجلسة غير صحيحة
                if (err.response?.status === 403) {
                    toast.error('انتهت جلسة المسؤول أو تم رفع الصلاحيات');
                    // حاول التحقق من الملف الشخصي
                    try {
                        const userRes = await api.get('/users/profile');
                        if (userRes.data && userRes.data.isAdmin) {
                            const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
                            userInfo.isAdmin = userRes.data.isAdmin;
                            localStorage.setItem('userInfo', JSON.stringify(userInfo));
                            // أعد المحاولة
                            const retryRes = await api.get('/stats');
                            setStats(retryRes.data);
                        } else {
                            router.replace('/');
                        }
                    } catch {
                        router.replace('/login');
                    }
                } else {
                    console.error(err);
                    setError('فشل جلب الإحصائيات');
                }
            }
            finally { setLoading(false); }
        };
        fetchStats();
    }, [checking, router]);

    // أدوات الإدارة مع البيانات الديناميكية المحدثة
    const adminTools = [
        { 
            name: 'إدارة المستخدمين', 
            count: `${stats.users.total} عضو مسجل`, 
            icon: <Users size={30} />, 
            link: '/admin/user', 
            color: 'text-blue-600', 
            bg: 'bg-blue-50',
            desc: 'التحكم في الأدوار والصلاحيات'
        },
        { 
            name: 'خزانة المنتجات', 
            count: `إدارة المخزون`, 
            icon: <Package size={30} />, 
            link: '/admin/products', 
            color: 'text-purple-600', 
            bg: 'bg-purple-50',
            desc: 'تعديل وحذف المنتجات الحالية'
        },
        { 
            name: 'إضافة منتج', 
            count: 'قطعة جديدة', 
            icon: <PlusCircle size={30} />, 
            link: '/admin/product/create', 
            color: 'text-green-600', 
            bg: 'bg-green-50',
            desc: 'نشر ملابس جديدة في المتجر'
        },
        { 
            name: 'الطلبات الواردة', 
            count: `${stats.sales.totalOrders} طلب إجمالي`, 
            icon: <ShoppingBag size={30} />, 
            link: '/admin/orders', 
            color: 'text-orange-600', 
            bg: 'bg-orange-50',
            desc: 'متابعة عمليات الشحن والتوصيل'
        },
        { 
            name: 'تحليلات البيع', 
            count: `${stats.sales.totalRevenue.toLocaleString()} د.ع`, 
            icon: <TrendingUp size={30} />, 
            link: '/admin/stats', 
            color: 'text-pink-600', 
            bg: 'bg-pink-50',
            desc: 'تقارير المبيعات والأرباح الفعلية'
        },
        { 
            name: 'التنبيهات', 
            count: 'إشعارات النظام', 
            icon: <Bell size={30} />, 
            link: '/admin/notifications', 
            color: 'text-yellow-600', 
            bg: 'bg-yellow-50',
            desc: 'متابعة نشاط المتجر لحظياً'
        },
        { 
            name: 'رسائل العملاء', 
            count: 'إدارة المحادثات', 
            icon: <MessageSquare size={30} />, 
            link: '/admin/messages', 
            color: 'text-indigo-600', 
            bg: 'bg-indigo-50',
            desc: 'قراءة والرد على رسائل الزبائن'
        },
        { 
            name: 'إعدادات المتجر', 
            count: 'تعديل النظام', 
            icon: <Settings size={30} />, 
            link: '/admin/settings', 
            color: 'text-gray-600', 
            bg: 'bg-gray-100',
            desc: 'إدارة العناوين والعملات والـ IP'
        },
        { 
            name: 'الأمان والنسخ', 
            count: 'مؤمن', 
            icon: <ShieldCheck size={30} />, 
            link: '/admin/security', 
            color: 'text-cyan-600', 
            bg: 'bg-cyan-50',
            desc: 'إدارة قواعد البيانات والجلسات'
        }
    ];

    if (checking || loading) return (
        <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
            <div className="text-center">
                <Loader2 className="animate-spin text-indigo-600 mb-4 mx-auto" size={50} />
                <p className="text-gray-500 font-bold">جاري تحميل بيانات ELIA...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <div dir="rtl"> تم تسجيل الدخول كمسؤول: {getCurrentUser()?.name} </div>
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16">
                    <div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                            <LayoutDashboard className="text-indigo-600" size={45} /> 
                            لوحة القيادة
                        </h1>
                        <p className="text-gray-500 mt-3 text-lg font-medium">إدارة شاملة لمتجر ELIA - العراق.</p>
                    </div>
                    
                    <div className="mt-6 md:mt-0 flex flex-col items-end gap-2">
                        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`}></div>
                            <span className="text-gray-700 font-bold uppercase tracking-tighter">
                                {error ? 'خطأ في الربط' : 'متصل بالسيرفر: 192.168.1.158'}
                            </span>
                        </div>
                        {error && <p className="text-red-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={14}/> {error}</p>}
                    </div>
                </div>

                {/* شبكة الكروت */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {adminTools.map((tool, i) => (
                        <Link href={tool.link} key={i} className="group h-full">
                            <div className="bg-white p-8 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-50 relative overflow-hidden transform hover:-translate-y-3 h-full flex flex-col">
                                
                                <div className={`absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity ${tool.color}`}>
                                    {React.cloneElement(tool.icon, { size: 120 })}
                                </div>

                                <div className={`${tool.bg} ${tool.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner`}>
                                    {tool.icon}
                                </div>
                                
                                <h3 className="text-2xl font-black text-gray-800 mb-2">{tool.name}</h3>
                                <p className="text-gray-400 text-sm font-bold mb-4 flex-grow">{tool.desc}</p>
                                
                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                                    <span className={`font-black text-sm ${tool.color}`}>{tool.count}</span>
                                    <div className="bg-gray-900 text-white p-2 rounded-xl group-hover:bg-indigo-600 transition-colors">
                                        <ArrowUpRight size={20} />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-20 text-center text-gray-400 font-medium border-t border-gray-100 pt-8">
                    <p>© 2025 ELIA E-COMMERCE | نظام الإدارة الموحد</p>
                </div>
            </div>
        </div>
    );
}
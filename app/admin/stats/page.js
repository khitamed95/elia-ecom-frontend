'use client';

export const dynamic = 'force-dynamic';
import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Package,
  Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

export default function AdminStatsPage() {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    // بيانات تجريبية لمحاكاة شكل الرسوم البيانية (سيتم استبدالها ببيانات حقيقية من السيرفر)
    const salesData = [
        { name: 'السبت', sales: 450000 },
        { name: 'الأحد', sales: 600000 },
        { name: 'الاثنين', sales: 300000 },
        { name: 'الثلاثاء', sales: 900000 },
        { name: 'الأربعاء', sales: 750000 },
        { name: 'الخميس', sales: 1200000 },
        { name: 'الجمعة', sales: 1500000 },
    ];

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // جلب المنتجات والمستخدمين من الـ API الموجود
                const productsRes = await api.get('/products');
                
                let totalUsers = 0;
                try {
                    const usersRes = await api.get('/users');
                    totalUsers = usersRes.data.length;
                } catch (err) {
                    if (err.response?.status !== 404) {
                        console.error('خطأ في جلب المستخدمين:', err);
                    }
                    // إذا كان 404 نتجاهل الخطأ والنتقل للأمام
                }
                
                setStats({
                    totalProducts: productsRes.data.length,
                    totalUsers: totalUsers,
                    totalOrders: 0, // سيتم تحديثه لاحقاً
                    totalRevenue: 0 // سيتم تحديثه لاحقاً
                });
            } catch (error) {
                console.error("فشل جلب الإحصائيات:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
            <Loader2 className="animate-spin text-indigo-600" size={50} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans" dir="rtl">
            <div className="max-w-7xl mx-auto">
                
                {/* الرأس */}
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4">
                        <TrendingUp className="text-indigo-600" size={40} />
                        التقارير والتحليلات الذكية
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg font-medium">متابعة دقيقة للأرباح والنمو بالدينار العراقي.</p>
                </div>

                {/* كروت الأرقام السريعة */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    <StatCard 
                        title="إجمالي المنتجات" 
                        value={stats.totalProducts.toString()} 
                        unit="منتج" 
                        icon={<Package />} 
                        color="text-indigo-600" 
                        bg="bg-indigo-50"
                        percent="+8%"
                        isUp={true}
                    />
                    <StatCard 
                        title="إجمالي المستخدمين" 
                        value={stats.totalUsers.toString()} 
                        unit="مستخدم" 
                        icon={<Users />} 
                        color="text-blue-600" 
                        bg="bg-blue-50"
                        percent="+5%"
                        isUp={true}
                    />
                    <StatCard 
                        title="عدد الطلبات" 
                        value={stats.totalOrders.toString()} 
                        unit="طلب" 
                        icon={<ShoppingBag />} 
                        color="text-indigo-600" 
                        bg="bg-indigo-50"
                        percent="+5%"
                        isUp={true}
                    />
                    <StatCard 
                        title="إجمالي المبيعات" 
                        value="0" 
                        unit="د.ع" 
                        icon={<DollarSign />} 
                        color="text-green-600" 
                        bg="bg-green-50"
                        percent="0%"
                        isUp={true}
                    />
                </div>

                {/* الرسوم البيانية */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    
                    {/* مخطط المبيعات الأسبوعي */}
                    <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-gray-800">مبيعات الأسبوع الحالي</h3>
                            <Calendar className="text-gray-400" size={20} />
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={salesData}>
                                    <defs>
                                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                                    <YAxis hide />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value) => [`${value.toLocaleString()} د.ع`, 'المبيعات']}
                                    />
                                    <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* مخطط الفئات الأكثر مبيعاً */}
                    <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
                        <h3 className="text-xl font-black text-gray-800 mb-8">الأقسام الأكثر طلباً</h3>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={[
                                    { name: 'رجالي', val: 400 },
                                    { name: 'نسائي', val: 700 },
                                    { name: 'أطفال', val: 200 },
                                    { name: 'إكسسوارات', val: 350 },
                                ]}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '15px' }} />
                                    <Bar dataKey="val" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// مكون الكارت الفرعي
function StatCard({ title, value, unit, icon, color, bg, percent, isUp }) {
    return (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className="flex justify-between items-start mb-4">
                <div className={`${bg} ${color} p-4 rounded-2xl`}>
                    {React.cloneElement(icon, { size: 26 })}
                </div>
                <div className={`flex items-center gap-1 text-sm font-black ${isUp ? 'text-green-500' : 'text-red-500'}`}>
                    {percent}
                    {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
            </div>
            <div>
                <p className="text-gray-400 font-bold text-sm mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-black text-gray-800">{value}</h2>
                    <span className="text-gray-400 font-bold text-xs">{unit}</span>
                </div>
            </div>
        </div>
    );
}
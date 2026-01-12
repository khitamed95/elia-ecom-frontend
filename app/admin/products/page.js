'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { getCurrentUser, isValidSession } from '@/lib/auth-helper';
import { 
    Trash2, Edit, Plus, Search, Package, 
    ArrowRight, Loader2, AlertCircle, Image as ImageIcon 
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export default function AdminProductsPage() {
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [checking, setChecking] = useState(true);

    const API_URL = 'http://192.168.1.158:5000';

    // 1. التحقق من الصلاحيات (Admin Only)
    useEffect(() => {
        const user = getCurrentUser();
        if (!isValidSession() || user?.isAdmin !== true) {
            toast.error('غير مصرح لك بدخول منطقة الإدارة');
            router.replace('/');
            return;
        }
        setChecking(false);
    }, [router]);

    // 2. جلب المنتجات من الباك إند
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/products');
            setProducts(data);
        } catch (err) {
            toast.error('فشل في تحميل المنتجات');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!checking) fetchProducts();
    }, [checking]);

    // 3. دالة معالجة روابط الصور
    const getImageUrl = (path) => {
        if (!path) return "https://via.placeholder.com/100";
        if (path.startsWith('http')) return path;
        return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    // 4. حذف منتج
    const deleteHandler = async (id) => {
        const result = await Swal.fire({
            title: 'هل أنت متأكد؟',
            text: "سيتم حذف هذا المنتج نهائياً من قاعدة البيانات",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'نعم، احذف',
            cancelButtonText: 'تراجع'
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/products/${id}`);
                setProducts(products.filter((p) => p.id !== id));
                toast.success('تم حذف المنتج بنجاح');
            } catch (err) {
                toast.error('حدث خطأ أثناء الحذف');
            }
        }
    };

    // 5. تصفية المنتجات حسب البحث
    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (checking || loading) return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="animate-spin text-indigo-600" size={50} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans" dir="rtl">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <button onClick={() => router.push('/admin')} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-2 font-bold transition-all">
                            <ArrowRight size={18} /> العودة للوحة التحكم
                        </button>
                        <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                            <Package className="text-indigo-600" /> خزانة المنتجات
                        </h1>
                    </div>
                    <Link href="/admin/product/create" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-indigo-100">
                        <Plus size={24} /> إضافة قطعة جديدة
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <input 
                        type="text" 
                        placeholder="ابحث عن منتج بالاسم..." 
                        className="w-full p-5 pr-14 bg-white rounded-3xl border-none shadow-sm focus:ring-2 focus:ring-indigo-600/20 font-bold outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search className="absolute right-5 top-5 text-gray-400" size={24} />
                </div>

                {/* Table */}
                <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-6 text-gray-500 font-black">الصورة</th>
                                    <th className="p-6 text-gray-500 font-black">اسم المنتج</th>
                                    <th className="p-6 text-gray-500 font-black">القسم</th>
                                    <th className="p-6 text-gray-500 font-black">السعر</th>
                                    <th className="p-6 text-gray-500 font-black">المخزن</th>
                                    <th className="p-6 text-gray-500 font-black text-center">العمليات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4">
                                            <img src={getImageUrl(product.image)} className="w-16 h-20 object-cover rounded-xl shadow-sm bg-white" alt={product.name} />
                                        </td>
                                        <td className="p-4 font-black text-gray-800">{product.name}</td>
                                        <td className="p-4"><span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold">{product.category}</span></td>
                                        <td className="p-4 font-bold text-green-600">{Number(product.price).toLocaleString()} د.ع</td>
                                        <td className="p-4 font-bold text-gray-500">{product.countInStock} قطعة</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/admin/product/edit/${product.id}`} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                                    <Edit size={18} />
                                                </Link>
                                                <button onClick={() => deleteHandler(product.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredProducts.length === 0 && (
                        <div className="p-20 text-center text-gray-400">
                            <AlertCircle className="mx-auto mb-4 opacity-20" size={60} />
                            <p className="font-bold">لا توجد منتجات مطابقة للبحث</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
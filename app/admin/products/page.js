import React from 'react';
import Link from 'next/link';
import { Package, AlertCircle, Plus, ArrowRight } from 'lucide-react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { fetchProductsForAdmin } from '@/app/actions';
import AdminProductsClient from './admin-products-client';

export const metadata = {
  title: 'إدارة المنتجات',
  description: 'إدارة منتجات المتجر'
};

export default async function AdminProductsPage() {
    let products = [];
    let error = null;

    try {
        // التحقق من أن المستخدم أدمن - يتم ذلك في Server Action
        products = await fetchProductsForAdmin();
    } catch (err) {
        if (err.message === 'Unauthorized') {
            redirect('/login');
        }
        error = err.message;
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans" dir="rtl">
            <div className="max-w-7xl mx-auto">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <Link href="/admin" className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-2 font-bold transition-all">
                            <ArrowRight size={18} /> العودة لوحة التحكم
                        </Link>
                        <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                            <Package className="text-indigo-600" /> خزانة المنتجات
                        </h1>
                    </div>
                    <Link href="/admin/product/create" className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-black transition-all shadow-lg shadow-indigo-100">
                        <Plus size={24} /> إضافة قطعة جديدة
                    </Link>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                        <p className="text-red-600 font-medium">{error}</p>
                    </div>
                )}

                {/* Products Client Component */}
                {products.length > 0 ? (
                    <AdminProductsClient products={products} />
                ) : (
                    <div className="bg-white rounded-[2.5rem] shadow-sm overflow-hidden border border-gray-100 p-20 text-center">
                        <AlertCircle className="mx-auto mb-4 opacity-20" size={60} />
                        <p className="font-bold text-gray-400">لا توجد منتجات</p>
                    </div>
                )}
            </div>
        </div>
    );
}
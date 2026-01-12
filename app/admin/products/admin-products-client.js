'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Edit, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { deleteProduct } from '@/app/actions';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AdminProductsClient({ products: initialProducts }) {
    const [products, setProducts] = useState(initialProducts);
    const [searchTerm, setSearchTerm] = useState('');

    const getImageUrl = (path) => {
        if (!path) return "https://via.placeholder.com/100";
        if (path.startsWith('http')) return path;
        return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
    };

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
                await deleteProduct(id);
                setProducts(products.filter((p) => p.id !== id));
                toast.success('تم حذف المنتج بنجاح');
            } catch (err) {
                toast.error('حدث خطأ أثناء الحذف');
            }
        }
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
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
                                        <img 
                                            src={getImageUrl(product.image)} 
                                            className="w-16 h-20 object-cover rounded-xl shadow-sm bg-white" 
                                            alt={product.name}
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/100";
                                            }}
                                        />
                                    </td>
                                    <td className="p-4 font-black text-gray-800">{product.name}</td>
                                    <td className="p-4"><span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-xs font-bold">{product.category}</span></td>
                                    <td className="p-4 font-bold text-green-600">{Number(product.price).toLocaleString()} د.ع</td>
                                    <td className="p-4 font-bold text-gray-500">{product.countInStock} قطعة</td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <Link href={`/admin/product/${product.id}/edit`} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                                <Edit size={18} />
                                            </Link>
                                            <button 
                                                onClick={() => deleteHandler(product.id)} 
                                                className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                            >
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
        </>
    );
}

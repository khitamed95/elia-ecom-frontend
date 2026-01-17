"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import { getImageUrl } from '@/lib/imageUtil'; 

const ProductCard = ({ product, isAdmin = false, onDelete }) => {
  const router = useRouter();
  const [imgCacheKey, setImgCacheKey] = useState(null);

  // احصل على timestamp من localStorage لكسر الكاش
  useEffect(() => {
    if (typeof window !== 'undefined' && product._id) {
      const stored = localStorage.getItem(`img_ts_${product._id}`);
      setImgCacheKey(stored || Date.now());
    }
  }, [product._id]);

  const handleDelete = (e) => {
    e.stopPropagation();
    Swal.fire({
      title: 'هل أنت متأكد؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف!',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#4f46e5'
    }).then((result) => {
      if (result.isConfirmed) onDelete(product.id);
    });
  };

  // بناء URL الصورة مع cache buster
  const imageUrl = () => {
    const baseUrl = getImageUrl(product.image);
    if (!imgCacheKey || baseUrl.startsWith('blob:') || baseUrl.startsWith('data:')) {
      return baseUrl;
    }
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}v=${imgCacheKey}`;
  };

  return (
    <div 
      onClick={() => router.push(`/product/${product.id}`)}
      className='bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-gray-100 flex flex-col h-full group'
    >
      {/* الصورة */}
      <div className="relative h-72 overflow-hidden bg-gray-50">
        <img
          src={imageUrl()}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { e.target.src = '/placeholder.svg'; }}
        />
      </div>

      {/* المحتوى */}
      <div className='p-6 flex-grow'>
        <h3 className='text-lg font-bold text-gray-800 truncate mb-1'>{product.name}</h3>
        <p className='text-2xl font-black text-indigo-600 mb-4'>
          {Number(product.price).toLocaleString()} <span className="text-sm">د.ع</span>
        </p>
        
        <div className="flex flex-wrap gap-1">
          {(product.availableSizes || []).map((size, idx) => (
            <span key={idx} className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-400">
              {size}
            </span>
          ))}
        </div>
      </div>

      {/* الأزرار */}
      <div className="p-6 pt-0">
        {isAdmin ? (
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); router.push(`/admin/product/edit/${product.id}`); }} 
              className="flex-1 bg-indigo-50 text-indigo-700 py-3 rounded-2xl font-bold hover:bg-indigo-600 hover:text-white transition-all"
            >تعديل</button>
            <button onClick={handleDelete} className="px-4 bg-red-50 text-red-600 py-3 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition-all">حذف</button>
          </div>
        ) : (
          <button className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-indigo-600 transition-all">إضافة للسلة</button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
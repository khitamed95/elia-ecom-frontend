'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Loader2, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ShippingStatusPage() {
  const router = useRouter();
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // يمكنك تعديل هذا ليأخذ ID من كود آخر أو من باراميتر
  const orderId = 2; // مثال ثابت، يفضل جلبه من باراميتر أو state

  useEffect(() => {
    async function fetchStatus() {
      setLoading(true);
      try {
        const { data } = await api.get(`/orders/${orderId}/status`);
        setOrderStatus(data);
      } catch (err) {
        setError(err.response?.data?.message || 'تعذر جلب حالة الشحن');
        toast.error(err.response?.data?.message || 'تعذر جلب حالة الشحن');
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6" dir="rtl">
      <div className="max-w-2xl mx-auto bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100">
        <h1 className="text-3xl font-black text-gray-800 mb-6 flex items-center gap-2">
          <Package size={32} className="text-indigo-600" /> حالة شحن الطلب
        </h1>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 text-red-600">
            <XCircle size={32} />
            <span>{error}</span>
          </div>
        ) : orderStatus ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Truck size={28} className="text-green-600" />
              <span className="font-bold text-lg">{orderStatus.status}</span>
            </div>
            <div className="bg-gray-100 rounded-xl p-4">
              <p className="text-gray-700 font-bold">تاريخ آخر تحديث:</p>
              <p className="text-gray-500">{orderStatus.updatedAt}</p>
            </div>
            {orderStatus.delivered ? (
              <div className="flex items-center gap-2 text-green-600 font-bold">
                <CheckCircle size={24} /> تم تسليم الطلب بنجاح
              </div>
            ) : (
              <div className="flex items-center gap-2 text-yellow-600 font-bold">
                <Truck size={24} /> الطلب قيد الشحن
              </div>
            )}
          </div>
        ) : null}
        <button
          onClick={() => router.back()}
          className="mt-8 w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white py-4 rounded-2xl font-black text-lg shadow-xl flex items-center justify-center gap-3"
        >
          العودة
        </button>
      </div>
    </div>
  );
}

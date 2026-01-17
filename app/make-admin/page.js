'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, User, Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

export default function MakeAdminPage() {
  const router = useRouter();
  useEffect(() => {
    toast.error('تم تعطيل خيار جعل الحساب أدمن');
    router.replace('/');
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
        <Shield className="text-indigo-600 mx-auto mb-4" size={40} />
        <h1 className="text-2xl font-bold text-gray-800">صلاحيات الأدمن</h1>
        <p className="text-gray-600 mt-2">تم تعطيل هذه الصفحة لحماية النظام.</p>
      </div>
    </div>
  );
}

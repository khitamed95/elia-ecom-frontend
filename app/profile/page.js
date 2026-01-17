'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProfileClient from './profile-client';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // جلب معلومات المستخدم من localStorage
    const userInfo = localStorage.getItem('userInfo');
    
    if (!userInfo) {
      router.replace('/login');
      return;
    }

    try {
      const userData = JSON.parse(userInfo);
      setUser(userData);
    } catch (err) {
      console.error('خطأ في قراءة بيانات المستخدم:', err);
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <ProfileClient initialUser={user} />
      </div>
    </div>
  );
}
import React from 'react';
import { redirect } from 'next/navigation';
import { fetchUserProfile } from '@/app/actions';
import ProfileClient from './profile-client';

export const metadata = {
  title: 'الملف الشخصي',
  description: 'إدارة الملف الشخصي الخاص بك'
};

export default async function ProfilePage() {
  let user = null;
  let error = null;

  try {
    user = await fetchUserProfile();
  } catch (err) {
    error = err.message;
    if (err.message === 'Unauthorized') {
      redirect('/login');
    }
  }

  if (!user && !error) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans" dir="rtl">
      <div className="max-w-3xl mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}
        
        {user && <ProfileClient initialUser={user} />}
      </div>
    </div>
  );
}
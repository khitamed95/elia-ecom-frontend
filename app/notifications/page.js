import React from 'react';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Bell, BellOff } from 'lucide-react';
import { fetchNotifications } from '@/app/actions';
import NotificationsClient from './notifications-client';

export const metadata = {
  title: 'الإشعارات',
  description: 'عرض الإشعارات الخاصة بك'
};

export default async function NotificationsPage() {
  let notifications = [];
  let error = null;

  try {
    notifications = await fetchNotifications();
  } catch (err) {
    error = err.message;
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-12 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-4 rounded-2xl">
                <Bell className="text-indigo-600" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">الإشعارات</h1>
                <p className="text-gray-600">
                  لديك {unreadCount} إشعار غير مقروء
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <BellOff className="mx-auto text-gray-300 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">لا توجد إشعارات</h2>
            <p className="text-gray-500">ستظهر إشعاراتك هنا عندما تتلقى أي تحديثات</p>
            <Link href="/">
              <button className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition">
                العودة للرئيسية
              </button>
            </Link>
          </div>
        ) : (
          <NotificationsClient initialNotifications={notifications} />
        )}

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link href="/">
            <button className="bg-white text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-100 transition shadow-md font-medium">
              العودة للرئيسية
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

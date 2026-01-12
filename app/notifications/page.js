'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bell, BellOff, X, Check, CheckCheck, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { isValidSession, getCurrentUser, handleAuthError } from '@/lib/auth-helper';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.158:5000';

  useEffect(() => {
    // لا نتحقق من الجلسة هنا، دع الصفحة تحاول جلب الإشعارات
    // إذا كان هناك 401، حينها نعيد التوجيه
    const user = getCurrentUser();
    setUserInfo(user);
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      
      if (!user) {
        console.warn('No user found in localStorage');
        toast.info('يرجى تسجيل الدخول لعرض الإشعارات');
        router.replace('/login?redirect=/notifications');
        return;
      }

      // تحديد التوكن - نحاول كل الاحتمالات
      const token = user.accessToken || user.token;
      
      if (!token) {
        console.warn('No access token found');
        toast.info('يرجى تسجيل الدخول لعرض الإشعارات');
        router.replace('/login?redirect=/notifications');
        return;
      }

      console.log('Fetching notifications with token:', token.substring(0, 20) + '...');

      const response = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          console.error('Authentication failed');
          toast.error('انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً');
          localStorage.removeItem('userInfo');
          router.replace('/login?redirect=/notifications');
          return;
        }
        throw new Error('فشل جلب الإشعارات');
      }

      const data = await response.json();
      console.log('Notifications data:', data);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('حدث خطأ أثناء جلب الإشعارات');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const user = getCurrentUser();
      const response = await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('فشل تحديث الإشعار');
      }

      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
      
      // إخبار الـ Header بتحديث عداد الإشعارات
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('حدث خطأ أثناء تحديث الإشعار');
    }
  };

  const markAllAsRead = async () => {
    try {
      const user = getCurrentUser();
      const response = await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('فشل تحديث الإشعارات');
      }

      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('تم تحديث جميع الإشعارات');
      
      // إخبار الـ Header بتحديث عداد الإشعارات
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('حدث خطأ أثناء تحديث الإشعارات');
    }
  };

  const deleteNotification = async (id) => {
    try {
      const user = getCurrentUser();
      const response = await fetch(`${API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('فشل حذف الإشعار');
      }

      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('تم حذف الإشعار');
      
      // إخبار الـ Header بتحديث عداد الإشعارات
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('حدث خطأ أثناء حذف الإشعار');
    }
  };

  const deleteReadNotifications = async () => {
    try {
      const user = getCurrentUser();
      const response = await fetch(`${API_URL}/api/notifications/read`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('فشل حذف الإشعارات المقروءة');
      }

      const data = await response.json();
      setNotifications(notifications.filter(n => !n.isRead));
      toast.success(`تم حذف ${data.count} إشعار`);
      
      // إخبار الـ Header بتحديث عداد الإشعارات
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (error) {
      console.error('Error deleting read notifications:', error);
      toast.error('حدث خطأ أثناء حذف الإشعارات');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message_reply':
        return <Bell className="text-blue-500" size={24} />;
      case 'order':
        return <Bell className="text-green-500" size={24} />;
      case 'product':
        return <Bell className="text-purple-500" size={24} />;
      default:
        return <Bell className="text-gray-500" size={24} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    
    return date.toLocaleDateString('ar-EG', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
      </div>
    );
  }

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

            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 transition flex items-center gap-2"
                >
                  <CheckCheck size={18} />
                  تحديد الكل كمقروء
                </button>
              )}
              {notifications.some(n => n.isRead) && (
                <button
                  onClick={deleteReadNotifications}
                  className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition flex items-center gap-2"
                >
                  <Trash2 size={18} />
                  حذف المقروءة
                </button>
              )}
            </div>
          </div>
        </div>

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
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl ${
                  !notification.isRead ? 'border-r-4 border-indigo-600' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`mt-1 ${!notification.isRead ? 'animate-pulse' : ''}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`font-bold ${!notification.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                            جديد
                          </span>
                        )}
                      </div>
                      
                      <p className={`mb-3 ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{formatDate(notification.createdAt)}</span>
                      </div>
                      
                      {notification.link && (
                        <Link href={notification.link}>
                          <button className="mt-3 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 transition text-sm font-medium">
                            عرض التفاصيل
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 mr-4">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-green-600 hover:bg-green-50 p-2 rounded-lg transition"
                        title="تحديد كمقروء"
                      >
                        <Check size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
                      title="حذف"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

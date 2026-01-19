'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications
} from '@/app/actions';

export default function NotificationsClient({ initialNotifications }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const router = useRouter();

  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, isRead: true } : n
      ));
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ أثناء تحديث الإشعار');
    }
  };

  const handleOpen = async (notification) => {
    try {
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }
      if (notification.link) {
        router.push(notification.link);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('تم تحديث جميع الإشعارات');
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ أثناء تحديث الإشعارات');
    }
  };

  const deleteNotif = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('تم حذف الإشعار');
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ أثناء حذف الإشعار');
    }
  };

  const deleteReadNotifs = async () => {
    try {
      await deleteAllReadNotifications();
      setNotifications(notifications.filter(n => !n.isRead));
      toast.success('تم حذف الإشعارات المقروءة');
      window.dispatchEvent(new Event('notificationsUpdated'));
    } catch (error) {
      console.error('Error:', error);
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

  return (
    <>
      {/* Action Buttons */}
      {(unreadCount > 0 || notifications.some(n => n.isRead)) && (
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 flex gap-2 justify-end">
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
              onClick={deleteReadNotifs}
              className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition flex items-center gap-2"
            >
              <Trash2 size={18} />
              حذف المقروءة
            </button>
          )}
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleOpen(notification)}
            className={`bg-white rounded-2xl shadow-lg p-6 transition-all hover:shadow-xl cursor-pointer ${
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
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpen(notification); }}
                      className="mt-3 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 transition text-sm font-medium"
                    >
                      عرض التفاصيل
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mr-4">
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotif(notification.id); }}
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
    </>
  );
}

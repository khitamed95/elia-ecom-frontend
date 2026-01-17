'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// اضبط الـ base مع /api ليتوافق مع مسارات الخادم
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.158:5000/api';
const API_URL = RAW_API_URL.replace(/\/$/, ''); // إزالة / في النهاية إن وجدت

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

// ==================== الإشعارات ====================
export async function fetchNotifications() {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) throw new Error('Unauthorized');

  try {
    const res = await fetch(`${API_URL}/notifications`, { headers: authHeaders(token), cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 401) redirect('/login');
      if (res.status === 404) return []; // Endpoint doesn't exist
      throw new Error('Failed to fetch notifications');
    }
    const data = await res.json();
    return data.notifications || [];
  } catch (error) {
    // Silently return empty list if endpoint not available
    if (error.message.includes('Failed to fetch')) return [];
    throw error;
  }
}

export async function markNotificationAsRead(id) {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) throw new Error('Unauthorized');
  const res = await fetch(`${API_URL}/notifications/${id}/read`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to mark notification as read');
  return res.json();
}

export async function markAllNotificationsAsRead() {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) throw new Error('Unauthorized');
  const res = await fetch(`${API_URL}/notifications/read-all`, {
    method: 'PATCH',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to mark all as read');
  return res.json();
}

export async function deleteNotification(id) {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) throw new Error('Unauthorized');
  const res = await fetch(`${API_URL}/notifications/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to delete notification');
  return res.json();
}

export async function deleteAllReadNotifications() {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) throw new Error('Unauthorized');
  const res = await fetch(`${API_URL}/notifications/read`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to delete read notifications');
  return res.json();
}

// ==================== الملف الشخصي ====================
export async function fetchUserProfile() {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) redirect('/login');

  const res = await fetch(`${API_URL}/users/profile`, {
    headers: authHeaders(token),
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 401) redirect('/login');
    const text = await res.text();
    throw new Error(`Failed to fetch profile: ${res.status} ${text}`);
  }
  return res.json();
}

export async function updateUserProfile(formData) {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${API_URL}/users/profile`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}` }, // ترك الـ Content-Type ليُضبط تلقائياً مع formData
    body: formData,
  });

  if (!res.ok) {
    let err;
    try {
      err = await res.json();
    } catch {
      err = {};
    }
    throw new Error(err.message || 'Failed to update profile');
  }
  return res.json();
}

// ==================== المنتجات (Admin) ====================
export async function fetchProductsForAdmin() {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) redirect('/login');

  const res = await fetch(`${API_URL}/products`, {
    headers: authHeaders(token),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch products');

  const data = await res.json();
  return Array.isArray(data) ? data : data.products || [];
}

export async function deleteProduct(productId) {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${API_URL}/api/products/${productId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
}

// ==================== الطلبات (User) ====================
export async function fetchUserOrders() {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) redirect('/login');

  const res = await fetch(`${API_URL}/orders/myorders`, {
    headers: authHeaders(token),
    cache: 'no-store',
  });
  if (!res.ok) {
    if (res.status === 401) redirect('/login');
    throw new Error('Failed to fetch orders');
  }
  return res.json();
}

export async function createOrder(orderData) {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    let err;
    try {
      err = await res.json();
    } catch {
      err = {};
    }
    throw new Error(err.message || 'Failed to create order');
  }
  return res.json();
}

// ==================== الطلبات (Admin) ====================
export async function updateOrderStatus(orderId, status) {
  const token = (await cookies()).get('accessToken')?.value;
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
}
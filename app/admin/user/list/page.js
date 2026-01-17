// app/admin/user/page.js

'use client'; 

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/axios';
import { toast } from 'react-toastify';
// لا نحتاج إلى استيراد Button/Table من react-bootstrap هنا
// يمكنك استيراد مكوناتك المخصصة (Loader, Message) إذا كانت موجودة

const UserListPage = () => {
    const router = useRouter();
    
    // حالات المكون
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState([]);
    const [userInfo, setUserInfo] = useState(null); 
    const [successDelete, setSuccessDelete] = useState(false);
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    // دالة لبناء رابط الصورة الشخصية
    const getAvatarUrl = (path) => {
        if (!path) return null;
        
        // روابط خارجية
        if (path.startsWith('http')) return path;
        
        // blob URLs
        if (path.startsWith('blob:')) return path;
        
        const BASE = API_URL || 'http://192.168.1.158:5000/api';
        
        // إذا كان المسار يبدأ بـ /
        if (path.startsWith('/')) {
            // إذا كان المسار يحتوي على /uploads
            if (path.includes('/uploads')) {
                const baseUrl = BASE.endsWith('/api') ? BASE.replace('/api', '') : BASE;
                return `${baseUrl}${path}`;
            }
            return `${BASE}${path}`;
        }
        
        // مسارات أخرى
        const baseUrl = BASE.endsWith('/api') ? BASE.replace('/api', '') : BASE;
        return `${baseUrl}/uploads/${path}`;
    }; 

    // 1. التحقق من صلاحية المسؤول وجلب التوكن من Local Storage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUserInfo = localStorage.getItem('userInfo');
            if (storedUserInfo) {
                const info = JSON.parse(storedUserInfo);
                setUserInfo(info);
                
                // إعادة التوجيه إذا لم يكن مسؤولاً
                if (!info.isAdmin) {
                    router.push('/'); 
                }
            } else {
                router.push('/login'); // إعادة التوجيه إذا لم يكن مسجلاً
            }
        }
    }, [router]);


    // 2. جلب قائمة المستخدمين
    useEffect(() => {
        if (userInfo && userInfo.isAdmin) {
            const fetchUsers = async () => {
                try {
                    setLoading(true);
                    
                    // المسار الخلفي لجلب جميع المستخدمين
                    try {
                        const { data } = await api.get('/users');
                        setUsers(data);
                        setSuccessDelete(false); // إعادة التعيين
                    } catch (err) {
                        if (err.response?.status === 404) {
                            toast.error('خيار إدارة المستخدمين غير متاح حالياً في الخادم');
                            setUsers([]);
                        } else {
                            throw err;
                        }
                    }
                    setLoading(false);
                } catch (err) {
                    toast.error(err.response?.data?.message || 'فشل في جلب المستخدمين');
                    setError(err.response?.data?.message || err.message);
                    setLoading(false);
                }
            };
            fetchUsers();
        }
    }, [userInfo, successDelete]); 


    // 3. دالة التعامل مع الحذف (Delete Handler)
    const deleteHandler = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
            try {
                // المسار الخلفي لحذف المستخدم
                await api.delete(`/users/${id}`);
                
                toast.success('تم حذف المستخدم بنجاح');
                // تفعيل successDelete لإعادة جلب القائمة وتحديث الواجهة
                setSuccessDelete(true); 

            } catch (err) {
                toast.error(err.response?.data?.message || 'فشل في حذف المستخدم');
                setError(err.response?.data?.message || err.message);
            }
        }
    };

    if (!userInfo || !userInfo.isAdmin) {
        return null; // منع عرض الواجهة إذا لم يكن مسؤولاً
    }

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">المستخدمون</h1>
            
            {loading ? (
                // يمكنك استبدال هذا بـ <Loader />
                <div className="text-blue-500">Loading Users...</div> 
            ) : error ? (
                // يمكنك استبدال هذا بـ <Message variant='danger'>{error}</Message>
                <div className="text-red-600 bg-red-100 p-3 rounded">{error}</div>
            ) : (
                <div className="overflow-x-auto shadow-lg sm:rounded-lg">
                    {/* الجدول بتنسيق Tailwind CSS */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الصورة</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">البريد الإلكتروني</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">مسؤول</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {user.avatar && getAvatarUrl(user.avatar) ? (
                                            <img 
                                                src={getAvatarUrl(user.avatar)}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-200"
                                                onError={(e) => { 
                                                    e.target.style.display = 'none';
                                                    e.target.nextElementSibling.style.display = 'flex';
                                                }}
                                            />
                                        ) : null}
                                        <div 
                                            className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold"
                                            style={{ display: user.avatar && getAvatarUrl(user.avatar) ? 'none' : 'flex' }}
                                        >
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800">
                                        <a href={`mailto:${user.email}`}>{user.email}</a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                                        {user.isAdmin ? (
                                            <span className="text-green-500">&#10003;</span> 
                                        ) : (
                                            <span className="text-red-500">&#10007;</span> 
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                        {/* زر التعديل (Edit Button) - ينقل إلى المسار الديناميكي */}
                                        <Link href={`/admin/user/${user.id}`} passHref>
                                            <button 
                                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs transition duration-150"
                                            >
                                                تعديل
                                            </button>
                                        </Link>

                                        {/* زر الحذف (Delete Button) */}
                                        {userInfo && user.id !== userInfo.id && ( 
                                            <button
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs transition duration-150"
                                                onClick={() => deleteHandler(user.id)}
                                            >
                                                حذف
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserListPage;
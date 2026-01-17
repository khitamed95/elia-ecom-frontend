'use client';

export const dynamic = 'force-dynamic';

import api from '@/lib/axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  UserCog, 
  Trash2, 
  UserCheck, 
  ShieldAlert, 
  Mail, 
  Search,
  Settings2
} from 'lucide-react';

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
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

    // 1. التحقق من الصلاحيات (Admin Protection)
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            router.push('/login');
            return;
        }
        const user = JSON.parse(userInfo);
        setCurrentUserId(user.id);
        if (!user.isAdmin) {
            toast.error('ليس لديك صلاحيات للوصول لهذه الصفحة');
            router.push('/');
            return;
        }
    }, [router]);

    // 2. جلب المستخدمين
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const { data } = await api.get('/users');
                setUsers(data);
            } catch (err) {
                if (err.response?.status === 404) {
                    toast.error('خيار إدارة المستخدمين غير متاح حالياً في الخادم');
                    setUsers([]);
                } else {
                    toast.error(err.response?.data?.message || 'فشل في جلب البيانات من السيرفر');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // 3. وظيفة الحذف
    const deleteHandler = async (id, name) => {
        try {
            await api.delete(`/api/users/${id}`);
            toast.success('تم حذف المستخدم بنجاح');
            setUsers(users.filter(u => u.id !== id));
            setDeleteModal({ isOpen: false, user: null });
        } catch (err) {
            toast.error(err.response?.data?.message || 'فشل في الحذف');
        }
    };

    // تصفية البحث
    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-10" dir="rtl">
            {/* نافذة تأكيد الحذف المخصصة */}
            {deleteModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full mx-4 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-red-100 p-4 rounded-full mb-4">
                                <ShieldAlert className="text-red-600" size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">تأكيد الحذف</h3>
                            <p className="text-gray-500 mb-6">
                                هل أنت متأكد من حذف حساب <span className="font-bold text-red-600">{deleteModal.user?.name}</span> نهائياً؟
                                <br />
                                <span className="text-sm">هذا الإجراء لا يمكن التراجع عنه.</span>
                            </p>
                            
                            <div className="flex gap-3 w-full">
                                <button 
                                    onClick={() => setDeleteModal({ isOpen: false, user: null })}
                                    className="flex-1 py-3 px-6 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all"
                                >
                                    إلغاء
                                </button>
                                <button 
                                    onClick={() => deleteHandler(deleteModal.user?.id, deleteModal.user?.name)}
                                    className="flex-1 py-3 px-6 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg"
                                >
                                    حذف نهائياً
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {/* رأس الصفحة */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                            <UserCog className="text-indigo-600" size={36} />
                            إدارة أعضاء المتجر
                        </h1>
                        <p className="text-gray-500 mt-2">يمكنك تعديل الأدوار، حذف الحسابات، ومراقبة صلاحيات النظام.</p>
                    </div>

                    {/* شريط البحث */}
                    <div className="relative group w-full md:w-96">
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input 
                            type="text" 
                            placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                            className="w-full pr-12 pl-4 py-4 rounded-2xl bg-white border-none shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* شبكة البطاقات (Cards Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredUsers.map((user) => (
                        <div 
                            key={user.id} 
                            className="bg-white rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group relative overflow-hidden"
                        >
                            {/* زخرفة خلفية بسيطة للحالة */}
                            <div className={`absolute top-0 left-0 w-2 h-full ${user.isAdmin ? 'bg-green-500' : 'bg-blue-400'}`}></div>

                            <div className="flex items-start justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    {user.avatar && getAvatarUrl(user.avatar) ? (
                                        <img 
                                            src={getAvatarUrl(user.avatar)}
                                            alt={user.name}
                                            className={`w-14 h-14 rounded-2xl object-cover shadow-lg ${user.isAdmin ? 'ring-2 ring-green-400' : 'ring-2 ring-blue-400'}`}
                                            onError={(e) => { 
                                                e.target.style.display = 'none';
                                                e.target.nextElementSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div 
                                        className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner ${user.isAdmin ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}
                                        style={{ display: user.avatar && getAvatarUrl(user.avatar) ? 'none' : 'flex' }}
                                    >
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                            {user.name}
                                            {user.isAdmin && <UserCheck size={18} className="text-green-500" />}
                                        </h3>
                                        <p className="text-sm text-gray-400 flex items-center gap-1">
                                            <Mail size={14} /> {user.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">الدور الحالي</span>
                                    <span className={`text-xs font-black px-3 py-1 rounded-lg ${user.isAdmin ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {user.isAdmin ? 'مسؤول النظام' : 'مستخدم عادي'}
                                    </span>
                                </div>

                                <div className="flex gap-2">
                                    {/* زر التعديل */}
                                    <Link href={`/admin/user/${user.id}`}>
                                        <button className="p-3 bg-gray-50 text-gray-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm" title="تعديل">
                                            <Settings2 size={20} />
                                        </button>
                                    </Link>

                                    {/* زر الحذف - يظهر فقط إذا لم يكن هذا هو حسابك الحالي */}
                                    {currentUserId !== user.id ? (
                                        <button 
                                            onClick={() => deleteHandler(user.id, user.name)}
                                            className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                            title="حذف"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    ) : (
                                        <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl opacity-50 cursor-not-allowed" title="لا يمكنك حذف نفسك">
                                            <ShieldAlert size={20} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[3rem] shadow-inner mt-10">
                        <p className="text-gray-400 text-xl">لم نجد أي مستخدم يطابق بحثك..</p>
                    </div>
                )}
            </div>
        </div>
    );
}
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { MessageSquare, Send, Clock, CheckCircle, Loader2, ArrowRight, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function UserMessagesPage() {
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState(null);
    const [expandedMessage, setExpandedMessage] = useState(null);

    useEffect(() => {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (!storedUserInfo) {
            toast.error('يرجى تسجيل الدخول أولاً');
            router.push('/login?redirect=/messages');
            return;
        }
        setUserInfo(JSON.parse(storedUserInfo));
        fetchMessages();
    }, [router]);

    const fetchMessages = async () => {
        try {
            const { data } = await api.get('/contact/my-messages');
            setMessages(Array.isArray(data) ? data : []);
        } catch (error) {
            if (error.response?.status === 404) {
                // Endpoint doesn't exist, silently show empty list
                setMessages([]);
            } else {
                console.error('Error fetching messages:', error);
                toast.error('فشل جلب الرسائل');
            }
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (msgId) => {
        try {
            await api.patch(`/contact/${msgId}`, { status: 'read' });
            // تحديث الحالة محلياً
            setMessages(prevMessages => 
                prevMessages.map(m => 
                    (m.id === msgId || m._id === msgId) ? { ...m, status: 'read' } : m
                )
            );
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const handleMessageClick = (msg) => {
        setExpandedMessage(msg.id || msg._id);
        // تحديد الرسالة كمقروءة تلقائياً عند فتحها
        if (msg.status !== 'read' && msg.status !== 'replied') {
            markAsRead(msg.id || msg._id);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
                <Loader2 className="animate-spin text-indigo-600" size={50} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] py-12 px-6" dir="rtl">
            <div className="max-w-4xl mx-auto">
                {/* زر العودة */}
                <button 
                    onClick={() => router.back()} 
                    className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 font-bold transition-all"
                >
                    <ArrowRight size={20} /> العودة للخلف
                </button>

                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4 mb-2">
                            <MessageSquare className="text-indigo-600" size={40} />
                            رسائلي
                        </h1>
                        <p className="text-gray-500 font-bold">جميع رسائلك والردود عليها</p>
                    </div>
                    <Link
                        href="/contact"
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all"
                    >
                        <Plus size={20} />
                        رسالة جديدة
                    </Link>
                </div>

                {messages.length === 0 ? (
                    <div className="bg-white p-16 rounded-[3rem] text-center border border-gray-100">
                        <MessageSquare className="text-gray-300 mx-auto mb-4" size={60} />
                        <p className="text-gray-400 font-bold text-lg">لم ترسل أي رسائل بعد</p>
                        <Link
                            href="/contact"
                            className="inline-block mt-6 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all"
                        >
                            إرسال رسالة جديدة
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {messages.map((msg) => {
                            const isExpanded = expandedMessage === (msg.id || msg._id);
                            return (
                            <div 
                                key={msg.id} 
                                className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                                onClick={() => handleMessageClick(msg)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-lg text-gray-900">{msg.subject}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                msg.status === 'replied' ? 'bg-green-100 text-green-700' :
                                                msg.status === 'read' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {msg.status === 'replied' ? 'تم الرد' : msg.status === 'read' ? 'مقروء' : 'جديد'}
                                            </span>
                                            {msg.replies && msg.replies.length > 0 && (
                                                <span className="text-xs text-indigo-600 font-bold">
                                                    ({msg.replies.length} {msg.replies.length === 1 ? 'رد' : 'ردود'})
                                                </span>
                                            )}
                                        </div>
                                        <p className={`text-gray-600 text-sm mb-3 ${!isExpanded && 'line-clamp-2'}`}>{msg.message}</p>
                                    </div>
                                </div>

                                {/* الردود من الإدارة */}
                                {isExpanded && msg.replies && msg.replies.length > 0 && (
                                    <div className="mt-6 space-y-4">
                                        <div className="flex items-center gap-2 mb-3 font-bold text-indigo-700">
                                            <Send size={16} />
                                            ردود الفريق الإداري ({msg.replies.length})
                                        </div>
                                        {msg.replies.map((reply, idx) => (
                                            <div key={idx} className="p-6 bg-indigo-50 rounded-2xl border-r-4 border-indigo-600">
                                                <p className="text-gray-700 leading-relaxed">{reply.message}</p>
                                                {reply.createdAt && (
                                                    <p className="text-gray-500 text-sm mt-3 flex items-center gap-2">
                                                        <Clock size={14} />
                                                        {new Date(reply.createdAt).toLocaleDateString('ar-IQ', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* معلومات الرسالة */}
                                {isExpanded && (
                                    <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
                                        <span className="flex items-center gap-2">
                                            <Clock size={14} />
                                            {new Date(msg.createdAt).toLocaleDateString('ar-IQ', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}


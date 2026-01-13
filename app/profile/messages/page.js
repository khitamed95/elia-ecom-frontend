'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { MessageSquare, CheckCircle, Clock, Send, ChevronLeft } from 'lucide-react';

export default function Messages() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get('/contact/my-messages');
      setMessages(response.data || []);
      setError('');
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.response?.data?.message || 'فشل تحميل الرسائل');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'new': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '🆕 جديدة' },
      'read': { bg: 'bg-blue-100', text: 'text-blue-800', label: '👀 مقروءة' },
      'replied': { bg: 'bg-green-100', text: 'text-green-800', label: '✅ تم الرد' }
    };
    const badge = badges[status] || badges['new'];
    return <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>{badge.label}</span>;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ChevronLeft className="text-gray-600" />
          </button>
          <MessageSquare className="text-purple-600" size={32} />
          <div>
            <h1 className="text-3xl font-black text-gray-900">رسائلي</h1>
            <p className="text-gray-600">عرض رسائلك والردود عليها</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin">
              <MessageSquare className="text-purple-600" size={40} />
            </div>
          </div>
        )}

        {/* Messages List */}
        {!loading && messages.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MessageSquare className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">لا توجد رسائل حتى الآن</p>
            <button
              onClick={() => router.push('/contact')}
              className="mt-6 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              إرسال رسالة جديدة
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition">
                {/* Message Header */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-1">{msg.subject}</h3>
                      <p className="text-purple-100 text-sm">{formatDate(msg.createdAt)}</p>
                    </div>
                    {getStatusBadge(msg.status)}
                  </div>
                </div>

                {/* Message Content */}
                <div className="p-6">
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border-r-4 border-purple-500">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>

                  {/* Reply Section */}
                  {msg.reply ? (
                    <div className="border-t-2 border-gray-200 pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="text-green-500" size={20} />
                        <h4 className="font-bold text-gray-900">رد الفريق</h4>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border-r-4 border-green-500">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{msg.reply}</p>
                        <p className="text-green-600 text-sm mt-3 flex items-center gap-2">
                          <Clock size={14} />
                          {formatDate(msg.replyDate)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="border-t-2 border-gray-200 pt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="text-yellow-500" size={20} />
                        <h4 className="font-bold text-gray-900">جاري المراجعة</h4>
                      </div>
                      <p className="text-gray-600 text-sm">سيتم الرد على رسالتك قريباً</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Send New Message Button */}
        {!loading && messages.length > 0 && (
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/contact')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:shadow-lg transition flex items-center gap-2 mx-auto"
            >
              <Send size={18} />
              إرسال رسالة جديدة
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Loader2, Trash2, Eye, Reply } from "lucide-react";
import Swal from "sweetalert2";

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const { data } = await api.get("/contact");
      setMessages(Array.isArray(data) ? data : data.messages || []);
    } catch (error) {
      Swal.fire("خطأ", "فشل جلب الرسائل", "error");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMessage = async (id) => {
    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حذف هذه الرسالة نهائياً",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "نعم، احذفها!",
      cancelButtonText: "إلغاء"
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/contact/${id}`);
        setMessages(messages.filter(m => m.id !== id || m._id !== id));
        Swal.fire("تم!", "تم حذف الرسالة", "success");
      } catch (error) {
        Swal.fire("خطأ", "فشل حذف الرسالة", "error");
      }
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/contact/${id}`, { status: "read" });
      fetchMessages();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const sendReply = async (id) => {
    if (!replyText.trim()) {
      Swal.fire("تنبيه", "اكتب ردك أولاً", "warning");
      return;
    }

    try {
      await api.post(`/contact/${id}/reply`, { message: replyText });
      Swal.fire("تم!", "تم إرسال الرد", "success");
      setReplyText("");
      setSelectedMessage(null);
      fetchMessages();
    } catch (error) {
      Swal.fire("خطأ", "فشل إرسال الرد", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900">إدارة الرسائل</h1>
          <p className="text-gray-500 font-bold">عدد الرسائل: {messages.length}</p>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-400 font-bold">لا توجد رسائل حالياً</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id || msg._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{msg.subject}</h3>
                    <p className="text-sm text-gray-500 font-bold">من: {msg.name}</p>
                    <p className="text-sm text-gray-500 font-bold">هاتف: {msg.phone}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-xs font-black ${msg.status === 'read' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {msg.status === 'read' ? 'مقروء' : 'جديد'}
                  </span>
                </div>

                <p className="text-gray-700 mb-4 p-4 bg-gray-50 rounded-xl">{msg.message}</p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedMessage(msg);
                      markAsRead(msg.id || msg._id);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition-all"
                  >
                    <Eye size={16} /> عرض والرد
                  </button>
                  <button
                    onClick={() => deleteMessage(msg.id || msg._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-all"
                  >
                    <Trash2 size={16} /> حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* نافذة الرد */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" dir="rtl">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
              <h2 className="text-2xl font-black text-gray-900 mb-4">الرد على: {selectedMessage.subject}</h2>
              <div className="bg-gray-50 p-4 rounded-xl mb-6">
                <p className="text-gray-700">{selectedMessage.message}</p>
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="اكتب ردك هنا..."
                className="w-full p-4 border-2 border-gray-200 rounded-xl outline-none focus:border-indigo-600 mb-4 resize-none h-32 font-bold"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => sendReply(selectedMessage.id || selectedMessage._id)}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-black hover:bg-indigo-700 transition-all"
                >
                  إرسال الرد
                </button>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-black hover:bg-gray-300 transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

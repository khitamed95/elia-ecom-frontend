'use client';

import React, { useState } from 'react';
import Button from '@/components/Button';
import { Save, Trash2, Plus, LogOut, Edit2, Download } from 'lucide-react';
import { toast } from 'react-toastify';

/**
 * مثال شامل على استخدام مكون الأزرار الجديد
 */
export default function ButtonsExamplePage() {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('تم الحفظ بنجاح! ✨');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-100 p-6 md:p-12" dir="rtl">
      <div className="max-w-6xl mx-auto">
        
        {/* رأس الصفحة */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            🎨 مكتبة الأزرار الحديثة
          </h1>
          <p className="text-lg text-gray-600">
            أمثلة شاملة على جميع أنواع الأزرار المتاحة مع تصاميم flat جميلة وحركات ناعمة
          </p>
        </div>

        {/* الأنواع المختلفة */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          
          {/* Primary Buttons */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Primary (الأساسي)</h2>
            <div className="space-y-4">
              <Button variant="primary">
                <Save size={20} />
                حفظ
              </Button>
              <Button variant="primary" size="sm">صغير</Button>
              <Button variant="primary" size="lg">كبير جداً</Button>
              <Button variant="primary" disabled>معطل</Button>
              <Button variant="primary" loading={loading} onClick={handleSave}>
                جاري المعالجة...
              </Button>
            </div>
          </div>

          {/* Success Buttons */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Success (الأخضر)</h2>
            <div className="space-y-4">
              <Button variant="success">
                <Plus size={20} />
                إضافة جديد
              </Button>
              <Button variant="success" size="sm">تصريح</Button>
              <Button variant="success" size="lg" className="w-full">
                موافقة كاملة
              </Button>
              <Button variant="success" disabled>تم بالفعل</Button>
              <Button variant="success">
                ✓ نجح
              </Button>
            </div>
          </div>

          {/* Danger Buttons */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Danger (الأحمر)</h2>
            <div className="space-y-4">
              <Button variant="danger">
                <Trash2 size={20} />
                حذف
              </Button>
              <Button variant="danger" size="sm">حذف سريع</Button>
              <Button variant="danger" size="lg">حذف نهائياً</Button>
              <Button variant="danger" disabled>غير قابل للحذف</Button>
              <Button variant="danger">
                ✕ إلغاء
              </Button>
            </div>
          </div>

          {/* Warning Buttons */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Warning (البرتقالي)</h2>
            <div className="space-y-4">
              <Button variant="warning">
                <Edit2 size={20} />
                تعديل
              </Button>
              <Button variant="warning" size="sm">تحذير</Button>
              <Button variant="warning" size="lg">انتبه!</Button>
              <Button variant="warning" disabled>لا يمكن التعديل</Button>
              <Button variant="warning">
                ⚠️ تنبيه مهم
              </Button>
            </div>
          </div>

          {/* Secondary Buttons */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Secondary (الثانوي)</h2>
            <div className="space-y-4">
              <Button variant="secondary">
                <LogOut size={20} />
                تسجيل الخروج
              </Button>
              <Button variant="secondary" size="sm">إلغاء</Button>
              <Button variant="secondary" size="lg">إجراء إضافي</Button>
              <Button variant="secondary" disabled>معطل حالياً</Button>
              <Button variant="secondary">
                ← العودة
              </Button>
            </div>
          </div>

          {/* Outline Buttons */}
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Outline (الحدود)</h2>
            <div className="space-y-4">
              <Button variant="outline">
                <Download size={20} />
                تحميل
              </Button>
              <Button variant="outline" size="sm">خيار ثانوي</Button>
              <Button variant="outline" size="lg">كبير بحدود</Button>
              <Button variant="outline" disabled>غير مفعل</Button>
              <Button variant="outline">
                ℹ️ معلومات
              </Button>
            </div>
          </div>
        </div>

        {/* الأحجام */}
        <div className="bg-white rounded-3xl p-8 shadow-lg mb-12">
          <h2 className="text-2xl font-black text-gray-900 mb-6">الأحجام المختلفة</h2>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-start">
            <Button size="sm" variant="primary">صغير (sm)</Button>
            <Button size="md" variant="primary">متوسط (md)</Button>
            <Button size="lg" variant="primary">كبير (lg)</Button>
          </div>
        </div>

        {/* أمثلة عملية */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-8 shadow-lg text-white">
          <h2 className="text-2xl font-black mb-6">أمثلة عملية</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold mb-3">نموذج التسجيل:</h3>
              <div className="flex gap-2">
                <Button variant="success" className="flex-1">تسجيل</Button>
                <Button variant="outline" className="flex-1">إلغاء</Button>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-3">إدارة المنتجات:</h3>
              <div className="flex gap-2">
                <Button variant="primary">تحرير</Button>
                <Button variant="danger">حذف</Button>
                <Button variant="warning">مراجعة</Button>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-3">عملية الدفع:</h3>
              <Button size="lg" className="w-full">
                <Plus size={20} />
                إتمام الطلب
              </Button>
            </div>
            <div>
              <h3 className="font-bold mb-3">حالة التحميل:</h3>
              <Button loading={loading} onClick={handleSave} className="w-full">
                معالجة الطلب...
              </Button>
            </div>
          </div>
        </div>

        {/* معلومات الاستخدام */}
        <div className="mt-12 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <h3 className="text-lg font-black text-yellow-900 mb-3">💡 نصائح الاستخدام</h3>
          <ul className="text-yellow-800 space-y-2">
            <li>✓ استخدم primary للإجراءات الرئيسية</li>
            <li>✓ استخدم success للتأكيدات الإيجابية</li>
            <li>✓ استخدم danger فقط للعمليات الحساسة</li>
            <li>✓ استخدم outline كخيار ثانوي</li>
            <li>✓ أضف الأيقونات لوضوح أكبر</li>
            <li>✓ استخدم size="lg" للأزرار المهمة</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

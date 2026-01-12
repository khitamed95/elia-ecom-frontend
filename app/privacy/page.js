'use client';

import React from 'react';
import { ShieldCheck, Lock, EyeOff, Database } from 'lucide-react';

export default function PrivacyPage() {
    const currentYear = new Date().getFullYear();

    return (
        <div className="min-h-screen bg-white py-20 px-6 font-sans" dir="rtl">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-10 border-b pb-8">
                    <div className="bg-indigo-600 text-white p-4 rounded-3xl shadow-lg">
                        <ShieldCheck size={40} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-gray-900">سياسة الخصوصية</h1>
                        <p className="text-gray-400 font-bold mt-1 uppercase tracking-widest text-xs">
                            آخر تحديث: {currentYear}
                        </p>
                    </div>
                </div>

                <div className="prose prose-indigo max-w-none space-y-12">
                    <section>
                        <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-3">
                            <Lock className="text-indigo-600" size={24} /> جمع المعلومات
                        </h2>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            في متجر **إيليا**، نجمع المعلومات التي تقدمها لنا مباشرة عند إنشاء حساب أو إتمام عملية شراء، بما في ذلك الاسم، عنوان الشحن، رقم الهاتف، والبريد الإلكتروني. هذه البيانات ضرورية لتوصيل طلباتك وتحسين تجربتك.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-800 mb-4 flex items-center gap-3">
                            <EyeOff className="text-indigo-600" size={24} /> كيف نستخدم بياناتك؟
                        </h2>
                        <ul className="grid md:grid-cols-2 gap-4">
                            {[
                                "تجهيز وشحن طلباتك إلى منزلك.",
                                "التواصل معك لتأكيد تفاصيل الطلب.",
                                "تحسين جودة المنتجات والخدمات المقدمة.",
                                "إرسال عروض حصرية (في حال اشتراكك)."
                            ].map((text, i) => (
                                <li key={i} className="bg-gray-50 p-4 rounded-2xl text-gray-700 font-bold text-sm list-none border-r-4 border-indigo-600">
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="bg-indigo-50 p-10 rounded-[3rem] border border-indigo-100">
                        <h2 className="text-2xl font-black text-indigo-900 mb-4 flex items-center gap-3">
                            <Database size={24} /> حماية البيانات
                        </h2>
                        <p className="text-indigo-800 leading-relaxed font-bold">
                            نحن نستخدم تقنيات تشفير متطورة لحماية قواعد بياناتنا. لا نقوم ببيع أو تأجير معلوماتك الشخصية لأي طرف ثالث. الوصول إلى بياناتك يقتصر فقط على الموظفين المخولين لإتمام عملية الشحن.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-black text-gray-800 mb-4">ملفات تعريف الارتباط (Cookies)</h2>
                        <p className="text-gray-600 leading-relaxed font-medium">
                            يستخدم موقعنا ملفات تعريف الارتباط لتحسين سرعة التصفح وتذكر محتويات سلتك. يمكنك تعطيل هذه الخاصية من إعدادات متصفحك، ولكن قد يؤثر ذلك على بعض وظائف المتجر.
                        </p>
                    </section>
                </div>

                <div className="mt-20 pt-10 border-t text-center text-gray-400 text-sm font-bold">
                    حقوق الطبع والنشر محفوظة لمتجر إيليا © {currentYear}
                </div>
            </div>
        </div>
    );
}
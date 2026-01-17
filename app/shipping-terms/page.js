'use client';

import Link from 'next/link';
import { ArrowRight, Truck, ShieldCheck, Clock, MapPin } from 'lucide-react';

export default function ShippingTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 font-bold transition-all">
          <ArrowRight size={20} /> العودة للرئيسية
        </Link>

        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-gray-100 space-y-8">
          <header className="space-y-3">
            <p className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full font-bold text-sm">
              <Truck size={18} /> سياسة الشحن والتوصيل
            </p>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900">شروط الشحن لدى ELIA</h1>
            <p className="text-gray-600 font-medium">نحرص على تسليم طلباتكم بسرعة وأمان مع توضيح جميع التفاصيل بوضوح.</p>
          </header>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Clock size={20} className="text-indigo-600" /> مدة التوصيل
            </h2>
            <ul className="space-y-2 text-gray-700 font-medium leading-relaxed list-disc pr-5">
              <li>بغداد: من 24 إلى 48 ساعة عمل.</li>
              <li>باقي المحافظات: من 2 إلى 5 أيام عمل حسب البعد وحالة الطرق.</li>
              <li>الأيام الرسمية والعطل قد تؤثر على المدة، وسنقوم بإبلاغكم بأي تغيير.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <MapPin size={20} className="text-indigo-600" /> رسوم التوصيل
            </h2>
            <ul className="space-y-2 text-gray-700 font-medium leading-relaxed list-disc pr-5">
              <li>يتم احتساب رسوم التوصيل أثناء إتمام الطلب بناءً على المحافظة والمنطقة.</li>
              <li>قد تتغير الرسوم في حال تغيير العنوان بعد شحن الطلب.</li>
              <li>طلبات العروض الخاصة قد تشمل شحناً مجانياً حسب ما هو مذكور في العرض.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <ShieldCheck size={20} className="text-indigo-600" /> الشحن الآمن والاستلام
            </h2>
            <ul className="space-y-2 text-gray-700 font-medium leading-relaxed list-disc pr-5">
              <li>نستخدم تغليفاً آمناً يحافظ على جودة المنتجات أثناء النقل.</li>
              <li>يرجى فحص الطرد عند الاستلام وإبلاغنا فوراً في حال وجود ضرر أو نقص.</li>
              <li>في حال عدم استلام الطلب، سيتم إعادة الجدولة مرة واحدة قبل الإلغاء.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Truck size={20} className="text-indigo-600" /> تتبع الشحنة
            </h2>
            <p className="text-gray-700 font-medium leading-relaxed">
              يمكنكم متابعة حالة الطلب من صفحة <Link href="/shipping-status" className="text-indigo-600 font-bold hover:underline">تتبع الشحنة</Link> باستخدام رقم الطلب أو رقم الهاتف.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <ArrowRight size={20} className="text-indigo-600" /> ملاحظات هامة
            </h2>
            <ul className="space-y-2 text-gray-700 font-medium leading-relaxed list-disc pr-5">
              <li>التوصيل يتم خلال أوقات العمل الرسمية فقط.</li>
              <li>إذا كان العنوان غير واضح أو مغلق، سيتواصل فريق التوصيل لتحديد موعد جديد.</li>
              <li>الطلبات الكبيرة أو الخاصة قد تتطلب وقتاً إضافياً، وسيتم إبلاغكم مسبقاً.</li>
            </ul>
          </section>

          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl text-gray-800 font-bold leading-relaxed">
            لأي استفسار حول الشحن، تواصل معنا عبر صفحة <Link href="/contact" className="text-indigo-700 hover:underline">اتصل بنا</Link> وسنكون سعداء بخدمتكم.
          </div>
        </div>
      </div>
    </div>
  );
}

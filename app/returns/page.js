'use client';
import { AlertCircle } from 'lucide-react';

export default function ReturnsPage() {
    return (
        <div className="min-h-screen bg-white py-20 px-6 font-sans" dir="rtl">
            <div className="max-w-3xl mx-auto border-2 border-dashed border-gray-200 p-10 rounded-[3rem]">
                <h1 className="text-3xl font-black text-gray-900 mb-8">سياسة الاستبدال والاسترجاع</h1>
                
                <div className="bg-yellow-50 p-6 rounded-2xl mb-8 flex gap-4 border border-yellow-100">
                    <AlertCircle className="text-yellow-600 shrink-0" />
                    <p className="text-sm text-yellow-800 font-bold leading-relaxed">
                        عزيزي الزبون، من حقك فحص المنتج عند باب المنزل قبل دفع المبلغ للمندوب. في حال وجود أي اختلاف، يمكنك إعادة الطلب مع المندوب ودفع أجور التوصيل فقط.
                    </p>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-black text-xl mb-3">فترة الاستبدال</h3>
                        <p className="text-gray-600">يمكن استبدال المنتج خلال 24 ساعة من تاريخ الاستلام، بشرط أن يكون المنتج بحالته الأصلية وبالتغليف الخاص به.</p>
                    </div>
                    <div>
                        <h3 className="font-black text-xl mb-3">الحالات التي لا يشملها الاستبدال</h3>
                        <ul className="list-disc list-inside text-gray-600 space-y-2 mr-4">
                            <li>المنتجات التي تم استخدامها أو غسلها.</li>
                            <li>القطع التي تعرضت للتلف بسبب سوء الاستخدام.</li>
                            <li>الملابس الداخلية (لأسباب صحية).</li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-black text-xl mb-3">آلية الاسترجاع</h3>
                        <p className="text-gray-600">يتم التواصل معنا عبر واتساب أو الاتصال المباشر لترتيب عملية الاستبدال، وتطبق أجور توصيل جديدة لعملية الاستبدال.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
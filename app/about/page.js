'use client';
import { ShieldCheck, Heart, Truck, Award } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white py-20 px-6 font-sans" dir="rtl">
            <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-5xl font-black text-gray-900 mb-6">متجر إيليا</h1>
                <p className="text-xl text-gray-600 mb-16 leading-relaxed">
                    من قلب العراق، انطلقنا لنعيد تعريف مفهوم التسوق الإلكتروني، مجمعين بين ذوق الأزياء الرفيع وأحدث تقنيات الأمان البرمجية.
                </p>

                <div className="grid md:grid-cols-2 gap-12 text-right">
                    <div className="flex gap-4 p-6 bg-gray-50 rounded-[2rem]">
                        <div className="bg-indigo-600 text-white p-3 rounded-2xl h-fit"><ShieldCheck size={30}/></div>
                        <div>
                            <h3 className="font-black text-xl mb-2">ثقة ومصداقية</h3>
                            <p className="text-gray-500 text-sm">نحن نؤمن بأن الصدق هو أساس النجاح، لذا نضمن لك مطابقة صور المنتجات للواقع تماماً.</p>
                        </div>
                    </div>
                    <div className="flex gap-4 p-6 bg-gray-50 rounded-[2rem]">
                        <div className="bg-indigo-600 text-white p-3 rounded-2xl h-fit"><Truck size={30}/></div>
                        <div>
                            <h3 className="font-black text-xl mb-2">توصيل ذكي</h3>
                            <p className="text-gray-500 text-sm">نغطي كافة محافظات العراق بنظام تتبع متطور يخبرك بمكان طلبك في كل لحظة.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-20 p-10 bg-indigo-600 rounded-[3rem] text-white">
                    <h2 className="text-3xl font-black mb-6 italic">رؤيتنا لعام 2026</h2>
                    <p className="text-indigo-100 leading-relaxed text-lg">
                        نسعى لأن نكون الوجهة الأولى لكل من يبحث عن التميز، مع الالتزام بتطوير منصتنا برمجياً لتوفير أسرع تجربة تسوق في العراق.
                    </p>
                </div>
            </div>
        </div>
    );
}
'use client';

export default function TermsPage() {
    const terms = [
        { title: "دقة المعلومات", content: "يقر المستخدم بأن جميع المعلومات المقدمة (الاسم، العنوان، رقم الهاتف) هي معلومات دقيقة وصحيحة." },
        { title: "تأكيد الطلبات", content: "يحتفظ متجر إيليا بحق الاتصال بالزبون هاتفياً لتأكيد الطلب قبل شحنه. في حال عدم الرد، قد يتم إلغاء الطلب." },
        { title: "التوصيل والأسعار", content: "أسعار التوصيل محددة حسب المحافظة (بغداد: 5000 د.ع، باقي المحافظات: 8000 د.ع) مالم يوجد عرض خاص." },
        { title: "حماية البيانات", content: "نحن ملتزمون بحماية بياناتك الشخصية ولا يتم مشاركتها مع أي طرف ثالث خارج إطار عملية التوصيل." }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-20 px-6 font-sans" dir="rtl">
            <div className="max-w-3xl mx-auto bg-white p-12 rounded-[3rem] shadow-sm">
                <h1 className="text-3xl font-black text-gray-900 mb-10 border-b pb-6">شروط الاستخدام</h1>
                <div className="space-y-8">
                    {terms.map((term, i) => (
                        <div key={i}>
                            <h3 className="text-lg font-black text-indigo-600 mb-2">{i + 1}. {term.title}</h3>
                            <p className="text-gray-600 leading-relaxed">{term.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
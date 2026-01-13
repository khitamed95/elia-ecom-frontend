'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { 
    PlusCircle, Image as ImageIcon, Link as LinkIcon, 
    Save, ArrowRight, Loader2, X, Tag, Hash, 
    Layers, AlignLeft 
} from 'lucide-react';

const SIZE_DATA = {
    // ملابس
    CLOTHING_MENS: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
    CLOTHING_WOMENS: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    CLOTHING_KIDS: ['2Y', '3Y', '4Y', '5Y', '6Y', '7Y', '8Y', '10Y', '12Y'],
    
    // أحذية
    SHOES_MENS: ['39', '40', '41', '42', '43', '44', '45', '46', '47'],
    SHOES_WOMENS: ['35', '36', '37', '38', '39', '40', '41', '42'],
    SHOES_KIDS: ['20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34'],
    
    // إكسسوارات
    ACCESSORIES: ['One Size']
};

// دالة العرض الموحدة (تدعم الروابط، الصور المرفوعة، ومعاينة المتصفح blob)
const getImageUrl = (path) => {
    if (!path) return "/placeholder.png";
    // إضافة blob: لضمان ظهور المعاينة عند اختيار ملف من الجهاز
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) {
        return path;
    }
    return `${process.env.NEXT_PUBLIC_API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

export default function CreateProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploadMethod, setUploadMethod] = useState('file'); 
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    
    const [formData, setFormData] = useState({
        name: '', price: '', oldPrice: '', brand: 'ELIA',
        category: 'رجالي', productType: 'ملابس',
        countInStock: '', description: '', imageUrl: ''
    });

    const [selectedSizes, setSelectedSizes] = useState([]);

    // عند تغيير نوع المنتج أو الفئة، امسح القياسات السابقة
    React.useEffect(() => {
        setSelectedSizes([]);
    }, [formData.productType, formData.category]);

    const getAvailableSizes = () => {
        // إكسسوارات دائماً One Size
        if (formData.productType === 'إكسسوارات') {
            return SIZE_DATA.ACCESSORIES;
        }
        
        // ملابس حسب الفئة
        if (formData.productType === 'ملابس') {
            if (formData.category === 'رجالي') return SIZE_DATA.CLOTHING_MENS;
            if (formData.category === 'نسائي') return SIZE_DATA.CLOTHING_WOMENS;
            if (formData.category === 'أطفال') return SIZE_DATA.CLOTHING_KIDS;
        }
        
        // أحذية حسب الفئة
        if (formData.productType === 'أحذية') {
            if (formData.category === 'رجالي') return SIZE_DATA.SHOES_MENS;
            if (formData.category === 'نسائي') return SIZE_DATA.SHOES_WOMENS;
            if (formData.category === 'أطفال') return SIZE_DATA.SHOES_KIDS;
        }
        
        return [];
    };

    const handleSizeToggle = (size) => {
        setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (uploadMethod === 'file' && selectedFiles.length === 0) return toast.warning('يرجى رفع صورة واحدة على الأقل');
        if (uploadMethod === 'url' && !formData.imageUrl) return toast.warning('يرجى وضع رابط الصورة');
        if (selectedSizes.length === 0) return toast.warning('يرجى اختيار قياس واحد على الأقل');

        setLoading(true);
        const data = new FormData();
        data.append('name', formData.name);
        data.append('price', formData.price);
        data.append('oldPrice', formData.oldPrice || '');
        data.append('brand', formData.brand);
        data.append('category', `${formData.productType} ${formData.category}`);
        data.append('description', formData.description);
        data.append('countInStock', formData.countInStock);
        data.append('availableSizes', JSON.stringify(selectedSizes));

        if (uploadMethod === 'file') {
            selectedFiles.forEach(file => data.append('images', file));
        } else {
            data.append('image', formData.imageUrl);
        }

        try {
            await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            toast.success('تم نشر المنتج بنجاح ✨');
            router.push('/admin/products');
        } catch (err) {
            toast.error(err.response?.data?.message || 'فشل في الحفظ');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12 font-sans" dir="rtl">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 mb-8 font-bold transition-all">
                    <ArrowRight size={20} /> العودة للخزانة
                </button>

                <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-xl border border-gray-100">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg"><PlusCircle size={30} /></div>
                        <h1 className="text-3xl font-black text-gray-800">إضافة قطعة جديدة</h1>
                    </div>

                    <form onSubmit={submitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-black text-gray-400 mr-2 flex items-center gap-2"><Tag size={16}/> اسم الموديل</label>
                            <input type="text" required className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-400 mr-2 flex items-center gap-2"><Layers size={16}/> صنف المنتج</label>
                            <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none cursor-pointer" value={formData.productType} onChange={(e) => { setFormData({...formData, productType: e.target.value}); setSelectedSizes([]); }}>
                                <option value="ملابس">ملابس</option>
                                <option value="أحذية">أحذية</option>
                                <option value="إكسسوارات">إكسسوارات</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-400 mr-2">القسم</label>
                            <select className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none cursor-pointer" value={formData.category} onChange={(e) => { setFormData({...formData, category: e.target.value}); setSelectedSizes([]); }}>
                                <option value="رجالي">رجالي</option>
                                <option value="نسائي">نسائي</option>
                                <option value="أطفال">أطفال</option>
                            </select>
                        </div>

                        <div className="md:col-span-2 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                            <label className="text-sm font-black text-indigo-600 mb-4 block">القياسات المتوفرة بناءً على اختيارك:</label>
                            <div className="flex flex-wrap gap-2">
                                {getAvailableSizes().map(size => (
                                    <button key={size} type="button" onClick={() => handleSizeToggle(size)}
                                        className={`px-6 py-2 rounded-xl font-bold transition-all ${selectedSizes.includes(size) ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-400 hover:bg-gray-100'}`}>
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-4">
                            <label className="text-sm font-black text-gray-400 mr-2 flex items-center gap-2"><ImageIcon size={16}/> صور المنتج</label>
                            <div className="flex bg-gray-100 p-1 rounded-2xl mb-4">
                                <button type="button" className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${uploadMethod === 'file' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`} onClick={() => setUploadMethod('file')}><ImageIcon size={18} /> رفع من الجهاز</button>
                                <button type="button" className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${uploadMethod === 'url' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`} onClick={() => setUploadMethod('url')}><LinkIcon size={18} /> رابط خارجي</button>
                            </div>

                            {uploadMethod === 'file' ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {previews.map((src, index) => (
                                        <div key={index} className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md group">
                                            <img src={getImageUrl(src)} className="w-full h-full object-cover" alt="معاينة" />
                                            <button type="button" onClick={() => removeFile(index)} className="absolute top-2 left-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                                        </div>
                                    ))}
                                    <label className="aspect-[3/4] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-all">
                                        <ImageIcon className="text-gray-300" size={30} />
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                </div>
                            ) : (
                                <input type="text" placeholder="https://example.com/image.jpg" className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-left outline-none border-2 border-transparent focus:border-indigo-500" dir="ltr" onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} />
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-400 mr-2">💰 السعر (د.ع)</label>
                            <input type="number" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-green-600 outline-none" onChange={(e) => setFormData({...formData, price: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-400 mr-2"><Hash size={16}/> الكمية</label>
                            <input type="number" required className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none" onChange={(e) => setFormData({...formData, countInStock: e.target.value})} />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-black text-gray-400 mr-2 flex items-center gap-2"><AlignLeft size={16}/> وصف القطعة</label>
                            <textarea required className="w-full p-4 bg-gray-50 rounded-2xl font-bold h-32 outline-none focus:ring-2 focus:ring-indigo-500" onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                        </div>

                        <button disabled={loading} className="md:col-span-2 bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-xl hover:bg-black transition-all flex items-center justify-center gap-3 mt-4 shadow-lg shadow-indigo-100">
                            {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                            نشر المنتج الآن
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
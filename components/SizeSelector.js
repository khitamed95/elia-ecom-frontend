'use client';

import React from 'react';
import { Check, Info } from 'lucide-react';

// تعريف البيانات المركزية للقياسات
const SIZE_DATA = {
    MENS: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
    WOMENS: ['XS', 'S', 'M', 'L', 'XL', '38', '40', '42'],
    KIDS: ['0-3 أشهر', '3-6 أشهر', '6-12 شهر', '1-2 سنة', '3-4 سنوات', '5-6 سنوات', '7-8 سنوات', '9-10 سنوات']
};

const SizeSelector = ({ category, selectedSizes, onSizeToggle }) => {
    // جلب القياسات بناءً على القسم الممرر للمكون
    const availableSizes = SIZE_DATA[category] || SIZE_DATA.MENS;

    return (
        <div className="space-y-4 p-6 bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-inner">
            <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                    القياسات المتوفرة لقسم {category === 'KIDS' ? 'الأطفال' : 'الكبار'}
                </label>
                <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-bold">
                    <Info size={12} />
                    يمكنك اختيار أكثر من قياس
                </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {availableSizes.map((size) => {
                    const isSelected = selectedSizes.includes(size);
                    
                    return (
                        <button
                            key={size}
                            type="button"
                            onClick={() => onSizeToggle(size)}
                            className={`relative py-3 px-2 rounded-2xl font-black text-xs transition-all duration-300 border-2 flex flex-col items-center justify-center gap-1 ${
                                isSelected
                                ? 'border-indigo-600 bg-white text-indigo-600 shadow-md transform scale-105'
                                : 'border-transparent bg-white text-gray-400 hover:border-indigo-200 hover:text-gray-600'
                            }`}
                        >
                            {size}
                            {isSelected && (
                                <div className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full p-1 shadow-sm">
                                    <Check size={10} strokeWidth={4} />
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {selectedSizes.length > 0 && (
                <p className="text-[10px] text-gray-400 font-bold mt-4">
                    تم اختيار: <span className="text-indigo-600">{selectedSizes.join('، ')}</span>
                </p>
            )}
        </div>
    );
};

export default SizeSelector;

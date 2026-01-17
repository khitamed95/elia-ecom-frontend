# 🎨 دليل الأزرار الجديدة الجميلة

تم إنشاء مكون Button حديث وقابل لإعادة الاستخدام مع تصاميم flat جميلة وحركات ناعمة.

## 📦 الملفات الجديدة

- `components/Button.js` - مكون الزر الرئيسي
- `app/buttons.css` - أنماط CSS للأزرار

## 🚀 طرق الاستخدام

### استيراد المكون
```jsx
import Button from '@/components/Button';
```

### أنواع الأزرار (variants)
```jsx
// Primary Button - الأرجواني الرئيسي
<Button variant="primary">انقر هنا</Button>

// Success Button - الأخضر
<Button variant="success">موافق ✓</Button>

// Danger Button - الأحمر
<Button variant="danger">حذف ✕</Button>

// Warning Button - البرتقالي
<Button variant="warning">تنبيه!</Button>

// Secondary Button - الرمادي
<Button variant="secondary">إلغاء</Button>

// Outline Button - الحدود
<Button variant="outline">خيار آخر</Button>
```

### أحجام الأزرار (sizes)
```jsx
<Button size="sm">صغير</Button>
<Button size="md">متوسط (افتراضي)</Button>
<Button size="lg">كبير</Button>
```

### مع الأيقونات
```jsx
import { Save, Trash2 } from 'lucide-react';

<Button variant="success">
  <Save size={20} />
  حفظ
</Button>

<Button variant="danger">
  <Trash2 size={20} />
  حذف
</Button>
```

### مع حالات التحميل
```jsx
<Button loading={isLoading}>
  جاري الحفظ...
</Button>
```

### معطلة
```jsx
<Button disabled>غير مفعل</Button>
```

### مثال متكامل
```jsx
import Button from '@/components/Button';
import { Save, Loader2 } from 'lucide-react';

export default function MyComponent() {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await saveData();
      toast.success('تم الحفظ!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Button 
        variant="success" 
        size="lg"
        loading={loading}
        onClick={handleSave}
      >
        <Save size={20} />
        حفظ البيانات
      </Button>
      
      <Button variant="outline">إلغاء</Button>
    </div>
  );
}
```

## 🎯 خصائص المكون

| الخاصية | النوع | الافتراضي | الوصف |
|---------|-------|----------|--------|
| `variant` | string | 'primary' | نوع الزر |
| `size` | string | 'md' | حجم الزر |
| `loading` | boolean | false | عرض حالة التحميل |
| `disabled` | boolean | false | تعطيل الزر |
| `onClick` | function | - | معالج النقر |
| `children` | ReactNode | - | محتوى الزر |
| `type` | string | 'button' | نوع الـ input |
| `className` | string | '' | فئات CSS إضافية |

## ✨ المميزات

- ✅ تصميم **flat modern** جميل
- ✅ حركات **smooth transitions** ناعمة
- ✅ **hover effects** جذابة
- ✅ دعم **gradients** متدرجة
- ✅ **responsive design** متوافق
- ✅ دعم **dark mode** (يمكن إضافته)
- ✅ **accessibility** متقدمة
- ✅ حالات **loading و disabled** مدعومة

## 🔄 الانتقال من الأزرار القديمة

### قبل:
```jsx
<button className="bg-indigo-600 text-white py-3 px-6 rounded-lg...">
  حفظ
</button>
```

### بعد:
```jsx
<Button variant="primary">حفظ</Button>
```

## 📝 ملاحظات

- جميع الأزرار لها **shadow effects** جميلة
- عند **hover** تتحرك الأزرار للأعلى قليلاً
- عند **click** تعود الأزرار لموقعها الأصلي
- يمكن دمج الخصائص المختلفة معاً

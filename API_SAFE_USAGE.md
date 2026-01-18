# دليل الاستخدام الآمن للـ API URLs 🔒

## المشاكل التي تم حلها:

❌ **المشاكل السابقة:**
- `undefined` في الـ console عند عدم تعريف المتغير
- عدم معالجة أخطاء الاتصال
- لا توجد validation للـ URL
- لا توجد معلومات debug في Development

✅ **الحل:**
- تحقق تلقائي من المتغيرات
- معالجة شاملة للأخطاء
- Validation للـ URLs
- logging مفيد في Development

---

## الكود المحسّن ✨

### الملف: `lib/apiConfig.js`

```javascript
// ✅ التحقق من المتغيرات
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ⚠️ تحذير إذا كان غير معرّف
if (!API_URL) {
  console.error('❌ خطأ: NEXT_PUBLIC_API_URL غير معرّف');
}

// ✅ معالجة آمنة للـ Profile
const getProfile = async () => {
  try {
    if (!API_URL) {
      throw new Error('API_URL غير معرّف');
    }

    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('❌ خطأ في getProfile:', error.message);
    throw error;
  }
};
```

---

## الميزات الرئيسية:

### 1️⃣ التحقق من البيئة
```javascript
const NODE_ENV = process.env.NODE_ENV || 'development';

if (NODE_ENV === 'development') {
  console.log('🌍 البيئة:', NODE_ENV);
  console.log('📡 رابط الـ API:', API_URL);
}
```

### 2️⃣ معالجة الأخطاء الذكية
```javascript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({}));
  throw new Error(
    errorData.message || `HTTP Error: ${response.status}`
  );
}
```

### 3️⃣ دعم axios أيضاً
```javascript
const getProfileWithAxios = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/profile`, {
      withCredentials: true,
      timeout: 10000,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      console.error('❌ غير مصرح (Unauthorized)');
    }
    throw error;
  }
};
```

### 4️⃣ التحقق من صحة الاتصال
```javascript
const checkAPIHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('❌ لا يمكن الوصول للـ API:', error.message);
    return false;
  }
};
```

---

## طريقة الاستخدام:

### في أي Component:

```javascript
'use client';

import { useEffect } from 'react';
import { getProfile } from '@/lib/apiConfig';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        setError(err.message);
        console.error('فشل جلب البيانات:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>❌ خطأ: {error}</div>;
  
  return (
    <div>
      <h1>البيانات الشخصية</h1>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </div>
  );
}
```

---

## مثال عملي كامل:

```javascript
// app/profile/page.js

'use client';

import { useEffect, useState } from 'react';
import { getProfile, checkAPIHealth } from '@/lib/apiConfig';
import toast from 'react-toastify';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        // ✅ تحقق من صحة الاتصال أولاً
        const isHealthy = await checkAPIHealth();
        
        if (!isHealthy) {
          throw new Error('الـ API غير متاح حالياً');
        }

        // ✅ احصل على البيانات
        const data = await getProfile();
        setProfile(data);
        
        // ✅ اظهر رسالة نجاح
        toast.success('تم جلب البيانات بنجاح');
      } catch (error) {
        // ❌ اظهر رسالة الخطأ
        toast.error('خطأ: ' + error.message);
        console.error('حدث خطأ:', error);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  if (isLoading) {
    return <div className="text-center p-4">جاري التحميل...</div>;
  }

  if (!profile) {
    return <div className="text-center p-4 text-red-500">فشل تحميل البيانات</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">البيانات الشخصية</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="font-semibold">الاسم:</h2>
            <p>{profile.name || 'غير محدد'}</p>
          </div>
          
          <div>
            <h2 className="font-semibold">البريد:</h2>
            <p>{profile.email || 'غير محدد'}</p>
          </div>
          
          <div>
            <h2 className="font-semibold">الهاتف:</h2>
            <p>{profile.phone || 'غير محدد'}</p>
          </div>
          
          <div>
            <h2 className="font-semibold">الدور:</h2>
            <p>{profile.role || 'مستخدم'}</p>
          </div>
        </div>
      </div>

      {/* Debug Info في Development فقط */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-100 rounded text-sm font-mono">
          <h3 className="font-bold mb-2">Debug Info:</h3>
          <pre>{JSON.stringify(profile, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

---

## عند حدوث مشاكل:

### ❌ المشكلة: `API_URL undefined`

**الحل:**
```bash
# تحقق من ملف .env.local
cat .env.local

# يجب أن يحتوي على:
NEXT_PUBLIC_API_URL=http://192.168.1.158:5000/api

# أعد تشغيل npm run dev
npm run dev
```

### ❌ المشكلة: `HTTP 401 Unauthorized`

**الحل:**
```javascript
// تأكد من وجود التوكن في الـ Cookies
// يجب أن تستخدم withCredentials: true
const response = await fetch(url, {
  credentials: 'include' // ✅ مهم جداً
});
```

### ❌ المشكلة: `CORS Error`

**الحل:**
```javascript
// في الـ backend تأكد من:
app.use(cors({
  origin: 'http://localhost:3000', // أو رابط Vercel
  credentials: true
}));
```

### ❌ المشكلة: `Timeout`

**الحل:**
```javascript
// استخدم timeout واضح
const response = await axios.get(url, {
  timeout: 10000 // 10 ثواني
});
```

---

## الملخص:

✅ **ملف جديد:** `lib/apiConfig.js`
- معالجة آمنة للـ URLs
- معالجة شاملة للأخطاء
- دوال مساعدة جاهزة
- دعم Development و Production

✅ **الفوائد:**
- لا مزيد من `undefined` errors
- معلومات debug مفيدة
- كود نظيف وقابل للصيانة
- سهل الاستخدام في جميع Components

🚀 **جاهز للاستخدام الآن!**

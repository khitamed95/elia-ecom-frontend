# 🚀 دليل البدء السريع للنظام الجديد

## ⚡ أسرع طريقة للبدء (5 دقائق)

### الخطوة 1: تسجيل الدخول
1. افتح الموقع على `http://localhost:3000`
2. اضغط على "تسجيل الدخول" أو "Login"
3. أدخل بيانات حسابك

### الخطوة 2: اختبار النظام
1. افتح `http://localhost:3000/token-debug`
2. اضغط "عرض معلومات التوكن"
3. سترى التوكن الخاص بك مباشرة

### الخطوة 3: اختبار التحديث التلقائي
1. اضغط "تعطيل التوكن (للاختبار)"
2. اضغط "اختبار API محمي"
3. يجب أن يحدث التوكن تلقائياً ✅

---

## 🛠️ للمطورين فقط

### استخدام Console (F12)
```javascript
// عرض معلومات الجلسة
window.authDebug.showTokenInfo();

// تعطيل التوكن (للاختبار)
window.authDebug.expireToken();

// حذف جميع البيانات
window.authDebug.clearAllData();
```

### استخدام في الكود

#### مثال 1: التحقق من الجلسة
```javascript
'use client';
import { isValidSession } from '@/lib/auth-helper';

if (!isValidSession()) {
  // المستخدم غير مسجل دخول
  window.location.href = '/login';
}
```

#### مثال 2: الحصول على بيانات المستخدم
```javascript
'use client';
import { getCurrentUser } from '@/lib/auth-helper';

const user = getCurrentUser();
console.log(user.email);  // بريد المستخدم
console.log(user.role);   // دور المستخدم (admin, user, etc)
```

#### مثال 3: استخدام Hook
```javascript
'use client';
import { useAuth } from '@/lib/use-auth';

export default function MyPage() {
  const { user, isLoggedIn, logout } = useAuth();
  
  if (!isLoggedIn) {
    return <div>Please login first</div>;
  }
  
  return (
    <div>
      <h1>Welcome {user.name}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### مثال 4: حماية صفحة Admin
```javascript
'use client';
import { ProtectRoute } from '@/lib/use-auth';

export default function AdminPage() {
  return (
    <ProtectRoute requiredRole="admin">
      <h1>Admin Dashboard</h1>
      <p>Only admins can see this</p>
    </ProtectRoute>
  );
}
```

---

## 📊 المرجع السريع

### الملفات الرئيسية

```
lib/
├── axios.js          ← Interceptor والتحديث التلقائي
├── auth-debug.js     ← أدوات Console
├── auth-helper.js    ← دوال مساعدة
└── use-auth.js       ← Hooks والحماية

app/
├── contact/page.js   ← نموذج التواصل (محمي)
├── admin/page.js     ← لوحة التحكم (محمية للـ admins)
└── token-debug/page.js ← صفحة الاختبار
```

### الدوال والـ Hooks

| الاسم | الملف | النوع | الهدف |
|-------|-------|--------|-------|
| `authDebug` | auth-debug.js | Object | أدوات Console |
| `isValidSession()` | auth-helper.js | Function | التحقق من الجلسة |
| `getCurrentUser()` | auth-helper.js | Function | بيانات المستخدم |
| `getToken()` | auth-helper.js | Function | الحصول على التوكن |
| `handleAuthError()` | auth-helper.js | Function | معالجة الأخطاء |
| `useAuth()` | use-auth.js | Hook | معلومات المصادقة |
| `ProtectRoute` | use-auth.js | Component | حماية الصفحات |

---

## 🐛 استكشاف المشاكل السريع

### المشكلة: "Cannot access page"
```javascript
// الحل: استخدم:
if (!isValidSession()) {
  window.location.href = '/login';
}
```

### المشكلة: "Token expired"
```javascript
// لا تفعل شيء! النظام سيحدث التوكن تلقائياً
// افتح Console لترى السجلات
```

### المشكلة: "API returns 401"
```javascript
// هذا طبيعي جداً! المحاولة ستتكرر تلقائياً
// شاهد Console لترى "Token refreshed successfully"
```

---

## 🎯 السيناريوهات الشائعة

### السيناريو 1: إرسال نموذج (مثل Contact)
```javascript
import { isValidSession } from '@/lib/auth-helper';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  // 1. تحقق من الجلسة
  if (!isValidSession()) {
    toast.error('Login required');
    window.location.href = '/login';
    return;
  }
  
  // 2. أرسل البيانات
  try {
    const res = await api.post('/contact', formData);
    toast.success('Sent successfully!');
  } catch (error) {
    toast.error('Error: ' + error.message);
  }
};
```

### السيناريو 2: صفحة Admin فقط
```javascript
export default function AdminPage() {
  return (
    <ProtectRoute requiredRole="admin">
      <AdminDashboard />
    </ProtectRoute>
  );
}
```

### السيناريو 3: عرض بيانات المستخدم
```javascript
export default function ProfilePage() {
  const user = getCurrentUser();
  
  return (
    <div>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

---

## ✅ قائمة التحقق النهائية

- [ ] تم تسجيل الدخول بنجاح
- [ ] اختبرت `/token-debug` بنجاح
- [ ] رأيت رسائل في Console
- [ ] اختبرت Contact Form
- [ ] اختبرت صفحة Admin
- [ ] لا توجد أخطاء في Console

---

## 📞 الدعم

إذا واجهت مشاكل:
1. افتح DevTools (F12)
2. شاهد Console للرسائل التفصيلية
3. جرب `/token-debug`
4. راجع `TROUBLESHOOTING_AUTH.md`

---

## 📚 المراجع

- **AUTH_SYSTEM_GUIDE.md** - الدليل الشامل
- **TOKEN_FIX_GUIDE.md** - شرح الإصلاحات
- **TROUBLESHOOTING_AUTH.md** - استكشاف الأخطاء
- **SUMMARY.md** - الملخص النهائي

---

**نصيحة:** استخدم `/token-debug` للاختبار السريع قبل الاتصال بـ Support! 🚀

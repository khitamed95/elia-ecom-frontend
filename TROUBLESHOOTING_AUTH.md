# 🔍 دليل تشخيص مشاكل التوكن والمصادقة

## الخطوة الأولى: التحقق من Console

1. افتح الموقع وسجل الدخول
2. اضغط F12 لفتح DevTools
3. اذهب لـ Tab "Console"
4. شاهد الرسائل:
   - ✅ "Token attached to request:" = التوكن يتم إرساله بشكل صحيح
   - ❌ "No token found in localStorage" = لا يوجد توكن

## الخطوة الثانية: عرض التوكن

في Console، اكتب:
```javascript
JSON.parse(localStorage.getItem('userInfo'))
```

يجب أن تشاهد:
```javascript
{
  id: "123",
  email: "user@example.com",
  accessToken: "eyJhbGci...",
  refreshToken: "eyJhbGci...",
  role: "user"
}
```

## الخطوة الثالثة: تفتيش Network

1. افتح Tab "Network"
2. افعل شيء محمي (مثل الدخول لـ /admin أو إرسال Contact Form)
3. شاهد الطلبات:
   - **Headers:** يجب أن تشاهد `Authorization: Bearer ...`
   - **Response:** يجب أن يكون 200 أو 201

## الخطوة الرابعة: اختبار التحديث التلقائي

1. اذهب إلى `/token-debug`
2. اضغط "تعطيل التوكن (للاختبار)"
3. اضغط "اختبار API محمي"
4. شاهد في Console:
   - 🔄 "Attempting to refresh token..."
   - ✅ "Token refreshed successfully" = نجح!
   - ❌ "Failed to refresh token" = فشل

## رسائل الأخطاء الشائعة

### 1️⃣ "No token found in localStorage"
**السبب:** المستخدم غير مسجل دخول
**الحل:** 
- تأكد من تسجيل الدخول أولاً
- اختبر من صفحة تتطلب تسجيل دخول

### 2️⃣ "No refresh token available"
**السبب:** البياك إند لم يرسل refresh token عند تسجيل الدخول
**الحل:**
- تحقق من response عند تسجيل الدخول في Tab Network
- يجب أن يتضمن `refreshToken`

### 3️⃣ "401: Unauthorized"
**السبب:** التوكن انتهت صلاحيته
**الحل:**
- يجب أن يحدث التحديث تلقائياً
- إذا استمرت المشكلة، تحقق من endpoint التحديث

### 4️⃣ "Cannot POST /users/refresh-token"
**السبب:** endpoint غير موجود في البياك إند
**الحل:**
```
تحقق من البياك إند:
1. هل الـ endpoint موجود؟
2. ما هو المسار الصحيح؟
3. هل يوجد middleware للمصادقة؟
```

### 5️⃣ خطأ CORS
**السبب:** مشكلة في تكوين CORS
**الحل:**
```javascript
// تأكد من أن البياك إند يسمح بـ requests من الفرونت:
origin: 'http://localhost:3000'
credentials: true
```

## اختبار سريع بدون الموقع

```javascript
// في Console:

// 1. عرض التوكن
window.authDebug.showTokenInfo();

// 2. تعطيل التوكن
window.authDebug.expireToken();

// 3. اختبار API
fetch('http://192.168.1.158:5000/api/users/profile', {
  headers: {
    'Authorization': 'Bearer ' + JSON.parse(localStorage.getItem('userInfo')).accessToken
  }
}).then(r => r.json()).then(d => console.log(d));

// 4. اختبار التحديث يدويًا
fetch('http://192.168.1.158:5000/api/users/refresh-token', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({refreshToken: JSON.parse(localStorage.getItem('userInfo')).refreshToken})
}).then(r => r.json()).then(d => console.log(d));
```

## معلومات مهمة عن التوكن

### JWT Token Structure:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJlbWFpbCI6IuKDu.8c0aA4w
├─ Header (ما نوع التوكن)
├─ Payload (البيانات - اسم، رقم عميل، إلخ)
└─ Signature (التحقق من صحة التوكن)
```

### مدة صلاحية التوكن:
- **Access Token:** عادة 15-60 دقيقة
- **Refresh Token:** عادة 7 أيام أو أكثر

## نصائح للإصلاح السريع

1. **امسح localStorage:**
```javascript
localStorage.clear();
window.location.reload();
```

2. **سجل دخول مرة أخرى:**
تأكد من أن البياك إند يرسل كل البيانات المطلوبة

3. **فتش البياك إند:**
تأكد من:
- ✅ Endpoint التحديث موجود
- ✅ يقبل POST request
- ✅ يتطلب refreshToken
- ✅ يرسل accessToken في الرد

4. **استخدم Postman للاختبار:**
```
POST: http://192.168.1.158:5000/api/users/refresh-token
Body: {"refreshToken": "..."}
```

## ملفات المرجعية

- `lib/axios.js` - logic الـ interceptor
- `lib/auth-debug.js` - أدوات التصحيح
- `lib/auth-helper.js` - دوال مساعدة
- `app/token-debug/page.js` - صفحة الاختبار

---
**إذا استمرت المشاكل بعد هذه الخطوات، قم بـ:**
1. التحقق من البياك إند endpoints
2. التأكد من أن قاعدة البيانات تعمل
3. التحقق من قيمة `refresh_token` المحفوظة في قاعدة البيانات

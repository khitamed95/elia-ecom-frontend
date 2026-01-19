# حل خطأ Google OAuth: redirect_uri_mismatch 🔴

## الخطأ:
```
Error 400: redirect_uri_mismatch
Access blocked: This app's request is invalid
```

---

## السبب:
الـ redirect URIs المُسجلة في Google Cloud Console لا تطابق URIs التطبيق الفعلية.

---

## ✅ الحل الكامل:

### 1️⃣ تسجيل الدخول إلى Google Cloud Console

اذهب إلى: [https://console.cloud.google.com](https://console.cloud.google.com)

### 2️⃣ اختر المشروع الصحيح

في الأعلى، تأكد من اختيار المشروع الذي يحتوي على OAuth Client ID:
```
91398978852-s5e2km0eogtqlrllma3joikrs0opvvft.apps.googleusercontent.com
```

### 3️⃣ الذهاب إلى Credentials

```
1. من القائمة الجانبية → APIs & Services
2. اختر Credentials
3. ابحث عن OAuth 2.0 Client ID الخاص بك
4. اضغط على Edit (أيقونة القلم ✏️)
```

### 4️⃣ تحديث Authorized JavaScript origins

أضف جميع هذه الـ Origins:

#### للتطوير المحلي:
```
http://localhost:3000
http://127.0.0.1:3000
http://192.168.1.158:3000
```

#### للإنتاج (Vercel):
```
https://your-app.vercel.app
https://your-custom-domain.com
```

**مثال:**
```
http://localhost:3000
https://elia-ecom-frontend.vercel.app
```

### 5️⃣ تحديث Authorized redirect URIs

أضف جميع هذه الـ URIs:

#### للتطوير المحلي:
```
http://localhost:3000
http://localhost:3000/login
http://localhost:3000/register
http://127.0.0.1:3000
http://192.168.1.158:3000
```

#### للإنتاج:
```
https://your-app.vercel.app
https://your-app.vercel.app/login
https://your-app.vercel.app/register
```

**⚠️ مهم:** اجعل كل URI في سطر منفصل!

### 6️⃣ احفظ التغييرات

اضغط **Save** في أسفل الصفحة.

---

## 📝 مثال كامل للإعدادات:

### Authorized JavaScript origins:
```
http://localhost:3000
http://192.168.1.158:3000
https://elia-ecom-frontend.vercel.app
```

### Authorized redirect URIs:
```
http://localhost:3000
http://localhost:3000/login
http://localhost:3000/register
http://192.168.1.158:3000
http://192.168.1.158:3000/login
https://elia-ecom-frontend.vercel.app
https://elia-ecom-frontend.vercel.app/login
https://elia-ecom-frontend.vercel.app/register
```

---

## 🔍 التحقق من الإعدادات الحالية:

### في Google Cloud Console:

1. اذهب إلى: **APIs & Services** → **Credentials**
2. ابحث عن Client ID: `91398978852-s5e2km0eogtqlrllma3joikrs0opvvft`
3. تحقق من القائمة الحالية
4. أضف أي URIs ناقصة

---

## 🧪 الاختبار:

### بعد تحديث الإعدادات:

```bash
# 1. احذف الكاش
rm -rf .next

# 2. أعد تشغيل التطبيق
npm run dev

# 3. جرّب تسجيل الدخول بـ Google
# http://localhost:3000/login
```

### إذا لم تعمل فوراً:

⏱️ **انتظر 5 دقائق** - Google تحتاج وقت لتطبيق التغييرات

---

## ⚠️ نصائح إضافية:

### 1. استخدم HTTPS في Production

```javascript
// في .env.production
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```

### 2. تحقق من Domain في Vercel

```
# Domain الرئيسي
https://your-app.vercel.app

# Domains إضافية
https://your-app-git-main-username.vercel.app
https://your-custom-domain.com
```

أضف **كل** الـ domains في Google Console!

### 3. لا تستخدم IP في Production

❌ **خطأ:**
```
http://192.168.1.158:3000  ❌ (للتطوير فقط)
```

✅ **صحيح:**
```
https://elia-ecom-frontend.vercel.app  ✅
```

---

## 🆘 إذا استمرت المشكلة:

### تحقق من الأخطاء في Console:

```javascript
// أضف هذا في layout.tsx للـ debugging
console.log('Google Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
```

### تحقق من .env.local:

```bash
# يجب أن يكون:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=91398978852-s5e2km0eogtqlrllma3joikrs0opvvft.apps.googleusercontent.com
```

### تحقق من .env.production:

```bash
# نفس القيمة:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=91398978852-s5e2km0eogtqlrllma3joikrs0opvvft.apps.googleusercontent.com
```

---

## 📋 Checklist سريع:

- [ ] سجلت دخول إلى Google Cloud Console
- [ ] اخترت المشروع الصحيح
- [ ] أضفت `http://localhost:3000` في Origins
- [ ] أضفت `http://localhost:3000/login` في Redirect URIs
- [ ] أضفت Vercel domain في Origins
- [ ] أضفت Vercel domain/login في Redirect URIs
- [ ] حفظت التغييرات
- [ ] انتظرت 5 دقائق
- [ ] أعدت تشغيل `npm run dev`
- [ ] جربت تسجيل الدخول

---

## 🎯 الإعدادات النهائية الموصى بها:

### Development:
```
Origins:
- http://localhost:3000
- http://192.168.1.158:3000

Redirect URIs:
- http://localhost:3000
- http://localhost:3000/login
- http://localhost:3000/register
- http://192.168.1.158:3000
- http://192.168.1.158:3000/login
```

### Production (Vercel):
```
Origins:
- https://elia-ecom-frontend.vercel.app

Redirect URIs:
- https://elia-ecom-frontend.vercel.app
- https://elia-ecom-frontend.vercel.app/login
- https://elia-ecom-frontend.vercel.app/register
```

---

## 🚀 بعد الإصلاح:

✅ Google Sign-In سيعمل في Development  
✅ Google Sign-In سيعمل في Production  
✅ لا مزيد من أخطاء redirect_uri_mismatch  

**ملاحظة:** قد تحتاج إلى تسجيل خروج وإعادة تسجيل دخول في Google Account لرؤية التغييرات.

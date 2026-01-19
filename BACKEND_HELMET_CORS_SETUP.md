# إعداد Backend لـ Google OAuth و CORS 🔧

## المشكلة:
- Cross-Origin-Opener-Policy تمنع Google OAuth من العمل
- CORS errors عند الاتصال من Frontend

---

## ✅ الحل الكامل للـ Backend

### 1️⃣ تثبيت Packages المطلوبة

في مجلد الـ Backend:

```bash
npm install helmet cors
```

---

### 2️⃣ تحديث server.js

أضف هذا الكود في بداية ملف `server.js` أو `index.js`:

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// ======================================
// 1️⃣ إعدادات Helmet مع COOP
// ======================================
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // أو قم بتخصيصها حسب احتياجك
  })
);

// ======================================
// 2️⃣ إعدادات CORS
// ======================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://192.168.1.158:3000',
  'https://elia-ecom-frontend.vercel.app',
  'https://your-custom-domain.com', // أضف domain الإنتاج
];

app.use(
  cors({
    origin: function (origin, callback) {
      // السماح بـ requests بدون origin (مثل mobile apps أو Postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.warn('⚠️ CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // مهم جداً للـ Cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ======================================
// 3️⃣ إعدادات Express الأساسية
// ======================================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ======================================
// 4️⃣ Static Files للصور
// ======================================
app.use('/uploads', express.static('uploads'));

// ======================================
// 5️⃣ Routes
// ======================================
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
// ... باقي الـ routes

// ======================================
// 6️⃣ Error Handling
// ======================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// ======================================
// 7️⃣ تشغيل الخادم
// ======================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Allowed Origins: ${allowedOrigins.join(', ')}`);
});

module.exports = app;
```

---

## 📝 ملاحظات مهمة:

### أ) إعدادات Helmet:

```javascript
helmet({
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }, // ✅ مهم لـ Google OAuth
  crossOriginEmbedderPolicy: false, // تعطيل COEP
  contentSecurityPolicy: false, // أو قم بتخصيصها
})
```

### ب) إعدادات CORS:

```javascript
cors({
  origin: allowedOrigins, // قائمة الـ domains المسموحة
  credentials: true, // ✅ مهم جداً للـ Cookies والتوكنات
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
})
```

### ج) Static Files:

```javascript
app.use('/uploads', express.static('uploads'));
```

هذا يسمح بالوصول للصور عبر:
```
http://localhost:5000/uploads/product-123.jpg
https://elia-ecom-backend.onrender.com/uploads/product-123.jpg
```

---

## 🧪 الاختبار:

### 1. اختبار CORS:

```bash
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:5000/api/products
```

يجب أن ترى:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
```

### 2. اختبار الصور:

```bash
# جرّب الوصول لصورة
curl http://localhost:5000/uploads/product-123.jpg
```

### 3. اختبار Google OAuth:

افتح Frontend → Login → اضغط "الدخول عبر جوجل"

لا يجب أن ترى أخطاء CORS أو COOP.

---

## 🚀 النشر على Render.com

### 1. تأكد من Environment Variables:

في Render Dashboard:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=91398978852-s5e2km0eogtqlrllma3joikrs0opvvft.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 2. أضف Vercel Domain للـ CORS:

في `server.js`:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://elia-ecom-frontend.vercel.app', // ✅ مهم
  // أضف أي domains إضافية
];
```

### 3. أعد تشغيل الخادم:

```bash
git add .
git commit -m "Add helmet and CORS configuration"
git push origin main
```

Render سيعيد التشغيل تلقائياً.

---

## ⚠️ استكشاف الأخطاء:

### ❌ خطأ: "Not allowed by CORS"

**الحل:**
```javascript
// تحقق من أن Vercel domain موجود في allowedOrigins
const allowedOrigins = [
  'https://elia-ecom-frontend.vercel.app', // ✅
];
```

### ❌ خطأ: "Cookies not working"

**الحل:**
```javascript
cors({
  credentials: true, // ✅ مهم جداً
  origin: allowedOrigins,
})
```

### ❌ خطأ: "Images not loading"

**الحل:**
```javascript
// تأكد من:
app.use('/uploads', express.static('uploads'));

// وأن المجلد موجود
mkdir uploads
```

---

## 📋 Checklist سريع:

Backend:
- [ ] تثبيت `helmet` و `cors`
- [ ] إضافة helmet config مع `same-origin-allow-popups`
- [ ] إضافة CORS مع `credentials: true`
- [ ] إضافة Frontend domain للـ allowedOrigins
- [ ] إضافة `/uploads` static middleware
- [ ] رفع التعديلات على Git
- [ ] إعادة تشغيل Render

Frontend (.env.production):
- [ ] `NEXT_PUBLIC_API_URL=https://elia-ecom-backend.onrender.com/api`
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID=91398978852-...`

Google Cloud Console:
- [ ] إضافة Vercel domain في Authorized Origins
- [ ] إضافة Vercel domain/login في Redirect URIs

---

## ✅ النتيجة النهائية:

بعد تطبيق كل الخطوات:

✅ Google OAuth يعمل بدون أخطاء COOP  
✅ CORS يسمح بطلبات من Frontend  
✅ الصور تُحمّل من `/uploads` بنجاح  
✅ Cookies والتوكنات تعمل بشكل صحيح  

🚀 جاهز للإنتاج!

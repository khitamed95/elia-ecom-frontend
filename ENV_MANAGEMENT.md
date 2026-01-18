# إدارة بيئات التطوير والإنتاج 🌍

## المشكلة التي تم حلها:
استخدام URLs مختلفة للـ API حسب البيئة (Development vs Production)

---

## الملفات المستخدمة:

### 1️⃣ `.env.local` (التطوير المحلي)
```dotenv
NEXT_PUBLIC_API_URL=http://192.168.1.158:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=91398978852-s5e2km0eogtqlrllma3joikrs0opvvft.apps.googleusercontent.com
```

**متى يُستخدم:**
- عند تشغيل `npm run dev`
- عند التطوير المحلي على جهازك

---

### 2️⃣ `.env.production` (الإنتاج - Vercel)
```dotenv
NEXT_PUBLIC_API_URL=https://elia-ecom-backend.onrender.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=91398978852-s5e2km0eogtqlrllma3joikrs0opvvft.apps.googleusercontent.com
```

**متى يُستخدم:**
- عند النشر على Vercel
- عند تشغيل `npm run build` ثم `npm run start`
- في الإنتاج الفعلي

---

## كيفية الاختيار التلقائي:

### عند التطوير المحلي:
```bash
npm run dev
↓
NODE_ENV = "development"
↓
يستخدم .env.local ✅
↓
NEXT_PUBLIC_API_URL = http://192.168.1.158:5000/api
```

### عند النشر على Vercel:
```bash
npm run build
↓
NODE_ENV = "production"
↓
يستخدم .env.production ✅
↓
NEXT_PUBLIC_API_URL = https://elia-ecom-backend.onrender.com/api
```

---

## 📝 المنطق في الكود:

### `lib/axios.js`:
```javascript
const NODE_ENV = process.env.NODE_ENV || 'development';
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.158:5000';

// Log environment info (development only)
if (NODE_ENV === 'development') {
    console.log('🌍 Environment:', NODE_ENV);
    console.log('📡 API URL:', API_URL);
}
```

### `next.config.ts`:
```typescript
const NODE_ENV = process.env.NODE_ENV || 'development';
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (NODE_ENV === 'production') {
  console.log('✅ Building for PRODUCTION');
  console.log('📡 Using API URL:', API_URL);
} else {
  console.log('✅ Building for DEVELOPMENT');
  console.log('📡 Using API URL:', API_URL);
}
```

---

## ✅ كيفية التحقق من أن كل شيء يعمل:

### أثناء التطوير المحلي:
```bash
npm run dev

# في Console Browser يجب أن ترى:
# 🌍 Environment: development
# 📡 API URL: http://192.168.1.158:5000
```

### أثناء البناء للإنتاج:
```bash
npm run build

# في Terminal يجب أن ترى:
# ✅ Building for PRODUCTION
# 📡 Using API URL: https://elia-ecom-backend.onrender.com/api
```

---

## 🔄 ترتيب الأولويات:

Next.js يختار الـ environment بهذا الترتيب:

1. ✅ `.env.production.local` (إن وجد - أعلى أولوية)
2. ✅ `.env.production` (في الإنتاج)
3. ✅ `.env.local` (في التطوير - أعلى من `.env`)
4. ✅ `.env` (ملف عام)

---

## 📋 Vercel Environment Variables:

عند نشر على Vercel، **يجب أن تضيف نفس المتغيرات في Dashboard:**

### في لوحة Vercel:
1. اذهب إلى Project Settings
2. Environment Variables
3. أضف:
   ```
   NEXT_PUBLIC_API_URL = https://elia-ecom-backend.onrender.com/api
   NEXT_PUBLIC_GOOGLE_CLIENT_ID = 91398978852-s5e2km0eogtqlrllma3joikrs0opvvft.apps.googleusercontent.com
   ```

---

## ⚠️ ملاحظات مهمة:

### 1. **لا تُخزن في Git:**
ملفات `.env.local` عادة لا تُرفع على GitHub (معترف بها في .gitignore)

```bash
# في .gitignore (عادة موجودة بالفعل)
.env.local
.env.*.local
```

### 2. **Public Variables فقط:**
استخدم `NEXT_PUBLIC_` للمتغيرات التي تُستخدم في Browser
```javascript
// ✅ يعمل في Browser
NEXT_PUBLIC_API_URL

// ❌ لا يعمل في Browser (فقط في Server)
DATABASE_URL
API_SECRET
```

### 3. **أعد تشغيل الخادم:**
عند تعديل `.env.local`، أعد تشغيل `npm run dev`

---

## 🧪 مثال عملي:

### السيناريو 1: تطوير محلي
```
1. npm run dev
2. Browser يذهب إلى http://localhost:3000
3. API calls تذهب إلى http://192.168.1.158:5000/api ✅
4. الصور تُحمل من http://192.168.1.158:5000/uploads ✅
```

### السيناريو 2: Vercel Production
```
1. npm run build && npm run start
2. Browser يذهب إلى https://elia-ecom-frontend.vercel.app
3. API calls تذهب إلى https://elia-ecom-backend.onrender.com/api ✅
4. الصور تُحمل من https://elia-ecom-backend.onrender.com/uploads ✅
```

---

## 🆘 استكشاف الأخطاء:

### ❌ المشكلة: API URL خاطئ عند النشر
**الحل:**
```bash
# تحقق من .env.production
cat .env.production

# تأكد من إضافته في Vercel Dashboard
# Project Settings → Environment Variables
```

### ❌ المشكلة: متغيرات لا تتحدث
**الحل:**
```bash
# أعد تشغيل npm run dev
# أو أعد تحميل الصفحة (Ctrl+Shift+R)
```

### ❌ المشكلة: API URL null في Production
**الحل:**
```bash
# تأكد أن اسم المتغير يبدأ بـ NEXT_PUBLIC_
# NEXT_PUBLIC_API_URL ✅
# API_URL ❌ (لن يعمل في Browser)
```

---

## 📞 الخلاصة:

| | Development | Production |
|---|---|---|
| الملف | `.env.local` | `.env.production` |
| الأمر | `npm run dev` | `npm run build` |
| API URL | `http://192.168.1.158:5000/api` | `https://elia-ecom-backend.onrender.com/api` |
| حالة NODE_ENV | `development` | `production` |
| تلقائي؟ | ✅ نعم | ✅ نعم |

**النتيجة:** لا تحتاج لتعديل يدوي - كل شيء يتغير تلقائياً! 🚀

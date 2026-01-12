# دليل رفع المشروع إلى Vercel 🚀

## 📋 الخطوات المطلوبة قبل الرفع

### 1️⃣ تجهيز Backend (مهم جداً)
قبل رفع Frontend، يجب رفع Backend على منصة سحابية:

**خيارات رفع Backend:**
- **Railway.app** (سهل ومجاني للبداية)
- **Render.com** (مجاني مع بعض القيود)
- **DigitalOcean App Platform**
- **AWS Elastic Beanstalk**
- **Heroku** (مدفوع الآن)

**بعد رفع Backend ستحصل على:**
- رابط Backend الجديد مثل: `https://your-backend.railway.app`

---

## 2️⃣ رفع المشروع إلى Vercel

### الطريقة الأولى: من GitHub (موصى بها)

#### أ. رفع الكود إلى GitHub
```bash
# إذا لم يكن لديك Git repository
git init
git add .
git commit -m "Initial commit for Vercel deployment"

# إنشاء repository جديد على GitHub ثم:
git remote add origin https://github.com/your-username/elia-ecom-frontend.git
git branch -M main
git push -u origin main
```

#### ب. ربط Vercel مع GitHub
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل دخول بحساب GitHub
3. اضغط **"New Project"**
4. اختر repository: `elia-ecom-frontend`
5. اضغط **"Import"**

---

### الطريقة الثانية: من سطر الأوامر

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# رفع المشروع
vercel
```

---

## 3️⃣ إعداد Environment Variables على Vercel

بعد استيراد المشروع، أضف المتغيرات التالية في:
**Settings → Environment Variables**

### المتغيرات المطلوبة:

```env
# Backend API URL - مهم جداً!
NEXT_PUBLIC_API_URL=https://your-backend.railway.app

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id

# Stripe Payment
NEXT_PUBLIC_STRIPE_KEY=pk_live_xxxxx

# Site URL (سيتم إنشاؤه تلقائياً بواسطة Vercel)
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
```

**📝 ملاحظة:** بعد إضافة المتغيرات، اضغط **"Redeploy"** من Deployments tab.

---

## 4️⃣ تحديث Google OAuth

بعد الحصول على رابط Vercel، أضفه في:
[Google Cloud Console](https://console.cloud.google.com/apis/credentials)

**Authorized JavaScript origins:**
```
https://your-project.vercel.app
```

**Authorized redirect URIs:**
```
https://your-project.vercel.app
https://your-project.vercel.app/login
https://your-project.vercel.app/register
```

---

## 5️⃣ تحديث CORS في Backend

في Backend Server (`server.js` أو `app.js`):

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-project.vercel.app',
    'https://your-custom-domain.com'  // إذا كان لديك domain مخصص
  ],
  credentials: true
}));
```

**ثم أعد تشغيل Backend:**
```bash
npm start
# أو في حالة Railway/Render: سيعيد التشغيل تلقائياً
```

---

## 6️⃣ اختبار المشروع بعد الرفع

### ✅ قائمة الفحص:

- [ ] الصفحة الرئيسية تعمل
- [ ] المنتجات تظهر من Backend
- [ ] تسجيل الدخول يعمل (Email + Google OAuth)
- [ ] إضافة المنتجات للسلة
- [ ] إتمام الطلب والدفع
- [ ] لوحة التحكم للأدمن تعمل
- [ ] الصور تظهر بشكل صحيح

### 🐛 حل المشاكل الشائعة:

#### ❌ API لا يعمل
```
Error: Network Error أو 404
```
**الحل:**
- تحقق من `NEXT_PUBLIC_API_URL` في Vercel Environment Variables
- تأكد أن Backend يعمل ومفتوح للعامة
- تحقق من CORS في Backend

---

#### ❌ الصور لا تظهر
**الحل:**
- تأكد من إضافة domain Backend في [next.config.ts](next.config.ts):
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'your-backend.railway.app',
      pathname: '/uploads/**',
    },
  ],
}
```
- أعد deploy من Vercel

---

#### ❌ Google OAuth لا يعمل
**الحل:**
- أضف Vercel domain في Google Console (كما في الخطوة 4)
- تحقق من `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- أعد deploy

---

## 7️⃣ Domain مخصص (اختياري)

لربط domain خاص بك (مثل: `elia-shop.com`):

1. اذهب إلى **Vercel → Settings → Domains**
2. أضف domain الجديد
3. نسخ DNS records المطلوبة
4. أضفها في موقع Domain registrar (مثل Namecheap, GoDaddy)
5. انتظر 24-48 ساعة للتفعيل

---

## 8️⃣ أوامر مفيدة

```bash
# عرض logs في الوقت الفعلي
vercel logs --follow

# عرض deployment الحالي
vercel ls

# حذف deployment قديم
vercel rm deployment-url

# تحديث environment variables
vercel env add NEXT_PUBLIC_API_URL production
```

---

## 📊 مراقبة الأداء

Vercel يوفر تلقائياً:
- ✅ Analytics (عدد الزوار، سرعة التحميل)
- ✅ Error tracking
- ✅ Build logs
- ✅ Automatic HTTPS
- ✅ CDN عالمي

---

## 🔒 الأمان

### نصائح مهمة:
1. **لا تستخدم** `.env.local` في production
2. أضف جميع الأسرار في Vercel Environment Variables
3. فعّل Rate limiting في Backend
4. استخدم HTTPS فقط
5. قم بتحديث dependencies بانتظام:
```bash
npm audit fix
npm update
```

---

## 🎯 التكلفة

### خطة Hobby (مجانية):
- ✅ Bandwidth: 100 GB/شهر
- ✅ Build time: 100 ساعة/شهر
- ✅ Serverless functions
- ✅ Automatic HTTPS
- ✅ Custom domains

### خطة Pro ($20/شهر):
- كل ما سبق +
- أداء أسرع
- Analytics متقدمة
- Priority support

---

## 📚 موارد إضافية

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Railway Docs](https://docs.railway.app/) (لرفع Backend)

---

## ✨ Done!

بعد اتباع هذه الخطوات، سيكون متجرك الإلكتروني متاحاً على الإنترنت! 🎉

**رابط المتجر:** `https://your-project.vercel.app`

---

## 💡 نصيحة أخيرة

قبل الإطلاق الرسمي:
1. اختبر جميع الميزات
2. أضف صفحة "من نحن" و"سياسة الخصوصية"
3. فعّل Google Analytics
4. أضف Sitemap لمحركات البحث
5. اختبر على أجهزة مختلفة (جوال، تابلت، كمبيوتر)

---

**تم التجهيز بنجاح! 🚀**

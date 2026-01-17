# إصلاح خطأ Cloudinary في الباك اند 🔧

## المشكلة
```
Unknown API key your_api_key
```

الباك اند يحاول استخدام Cloudinary لرفع الصور ولكن API key غير صحيح.

---

## الحل السريع (الموصى به)

### الخطوة 1: احصل على حساب Cloudinary مجاني

1. اذهب إلى: https://cloudinary.com/users/register/free
2. سجل حساب جديد (أو سجل دخول إذا كان لديك حساب)
3. من لوحة التحكم (Dashboard)، انسخ:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### الخطوة 2: أضف المعلومات في الباك اند

في مجلد الباك اند، افتح ملف `.env` (أو أنشئه إذا لم يكن موجوداً):

```env
# معلومات Cloudinary
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name_here
CLOUDINARY_API_KEY=your_actual_api_key_here
CLOUDINARY_API_SECRET=your_actual_api_secret_here
```

**⚠️ مهم**: استبدل القيم بالمعلومات الحقيقية من حسابك!

### الخطوة 3: تأكد من إعداد Cloudinary في الكود

افتح ملف الباك اند الذي يحتوي على إعداد Cloudinary (عادة `config/cloudinary.js` أو `utils/cloudinary.js`):

```javascript
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = cloudinary;
```

**تأكد من أن الكود يستخدم `process.env` وليس قيم ثابتة مثل `'your_api_key'`!**

### الخطوة 4: أعد تشغيل الباك اند

```bash
# في مجلد الباك اند
npm start
# أو
node server.js
# أو
nodemon server.js
```

---

## الحل البديل (بدون Cloudinary)

إذا لم ترغب في استخدام Cloudinary، يمكنك حفظ الصور محلياً:

### الخطوة 1: تعديل multer config

في ملف الباك اند (عادة `productController.js` أو `routes/productRoutes.js`):

```javascript
const multer = require('multer');
const path = require('path');

// إعداد التخزين المحلي
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // تأكد من وجود مجلد uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    // قبول الصور فقط
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('الملف يجب أن يكون صورة!'), false);
    }
  }
});
```

### الخطوة 2: تعديل route لحفظ الصور

```javascript
// في productRoutes.js أو productController.js
router.put('/api/products/:id', upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    
    // إذا كان هناك ملفات مرفوعة
    if (req.files && req.files.length > 0) {
      // احفظ مسارات الصور
      const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
      req.body.images = imagePaths;
      req.body.image = imagePaths[0]; // أول صورة كصورة رئيسية
    }
    
    // باقي كود التحديث...
    const updatedProduct = await Product.update(id, req.body);
    res.json(updatedProduct);
    
  } catch (error) {
    console.error('خطأ في تحديث المنتج:', error);
    res.status(500).json({ message: error.message });
  }
});
```

### الخطوة 3: أنشئ مجلد uploads

في مجلد الباك اند:
```bash
mkdir uploads
```

### الخطوة 4: اجعل مجلد uploads متاح publicly

في `server.js` أو `app.js`:

```javascript
const express = require('express');
const app = express();

// اجعل مجلد uploads متاح للوصول
app.use('/uploads', express.static('uploads'));
```

---

## التحقق من الإصلاح

بعد تطبيق أحد الحلول:

1. **أعد تشغيل الباك اند**
2. **في الفرونت اند، افتح صفحة تعديل منتج**
3. **ارفع صورة جديدة واحفظ**
4. **افتح Console (F12)** وتحقق من:
   - ✅ لا يوجد خطأ "Unknown API key"
   - ✅ status code = 200 (نجح)
   - ✅ response تحتوي على `images` array أو `image` string

---

## ملاحظات مهمة

### إذا استخدمت Cloudinary:
- ✅ الصور تُحفظ في السحابة (آمنة)
- ✅ لا تشغل مساحة على السيرفر
- ✅ تحسين تلقائي للصور
- ❌ تحتاج اتصال إنترنت
- ❌ حد مجاني محدود (25GB/شهر)

### إذا استخدمت Local Storage:
- ✅ لا تحتاج حساب خارجي
- ✅ سرعة أعلى
- ✅ غير محدود
- ❌ الصور على السيرفر فقط
- ❌ قد تشغل مساحة كبيرة
- ❌ تحتاج backup منفصل

---

## استكشاف الأخطاء

### إذا استمر الخطأ:

1. **تحقق من ملف `.env`**:
   ```bash
   # في مجلد الباك اند
   cat .env
   # أو
   type .env
   ```
   
2. **تحقق من تحميل dotenv**:
   ```javascript
   // في server.js أو app.js (في أول سطر)
   require('dotenv').config();
   ```

3. **تحقق من Console في الباك اند**:
   ```javascript
   console.log('Cloudinary Config:', {
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY ? '✅ موجود' : '❌ مفقود',
     api_secret: process.env.CLOUDINARY_API_SECRET ? '✅ موجود' : '❌ مفقود'
   });
   ```

4. **أعد تشغيل الباك اند بعد كل تعديل!**

---

## الحل النهائي

**الأسرع**: استخدم Cloudinary (5 دقائق فقط)
**الأفضل للتطوير المحلي**: Local Storage

اختر الحل المناسب لمشروعك وطبقه! 🚀

---

**بعد الإصلاح، ارجع للفرونت اند وجرب رفع الصور مرة أخرى!** ✨

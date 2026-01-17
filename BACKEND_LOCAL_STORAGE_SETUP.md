# إعداد حفظ الصور محلياً في الباك اند 📁

بما أن Cloudinary غير متوفر في بلدك، سنحفظ الصور محلياً على السيرفر.

---

## الخطوات الكاملة

### الخطوة 1: تثبيت multer (إذا لم يكن مثبتاً)

في مجلد الباك اند، افتح Terminal وشغّل:

```bash
npm install multer
```

---

### الخطوة 2: إنشاء مجلد uploads

في مجلد الباك اند:

```bash
# في Windows PowerShell
New-Item -ItemType Directory -Path "uploads" -Force

# أو في Command Prompt
mkdir uploads
```

---

### الخطوة 3: إنشاء ملف multer config

أنشئ ملف جديد: `config/multer.js` (أو `utils/multer.js`)

```javascript
const multer = require('multer');
const path = require('path');

// إعداد التخزين المحلي
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // مجلد الحفظ
  },
  filename: function (req, file, cb) {
    // إنشاء اسم فريد للملف
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  }
});

// فلترة الملفات - قبول الصور فقط
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم! يجب أن يكون صورة.'), false);
  }
};

// إعداد multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB maximum
  }
});

module.exports = upload;
```

---

### الخطوة 4: تحديث Product Routes

افتح ملف `routes/productRoutes.js` (أو ما يشابهه) وعدّله:

```javascript
const express = require('express');
const router = express.Router();
const upload = require('../config/multer'); // استورد multer config
const { protect, admin } = require('../middleware/authMiddleware'); // إذا كان موجود

// دالة تحديث المنتج
router.put('/api/products/:id', protect, admin, upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('📦 تحديث المنتج:', id);
    console.log('📁 عدد الملفات المرفوعة:', req.files?.length || 0);
    console.log('📝 البيانات:', req.body);
    
    // البيانات من الـ form
    const updateData = {
      name: req.body.name,
      price: parseFloat(req.body.price),
      brand: req.body.brand || 'ELIA',
      category: req.body.category,
      description: req.body.description || '',
      countInStock: parseInt(req.body.countInStock),
      availableSizes: JSON.parse(req.body.availableSizes || '[]'),
      isPopular: req.body.isPopular === 'true',
      rating: parseFloat(req.body.rating || 0),
      numReviews: parseInt(req.body.numReviews || 0)
    };
    
    // إذا كان oldPrice موجود
    if (req.body.oldPrice) {
      updateData.oldPrice = parseFloat(req.body.oldPrice);
    }
    
    // إذا كانت هناك صور جديدة مرفوعة
    if (req.files && req.files.length > 0) {
      // إنشاء مسارات الصور
      const imagePaths = req.files.map(file => `/uploads/${file.filename}`);
      updateData.images = imagePaths;
      updateData.image = imagePaths[0]; // الصورة الأولى كصورة رئيسية
      
      console.log('✅ تم حفظ الصور:', imagePaths);
    }
    
    // تحديث المنتج في قاعدة البيانات
    // ⚠️ عدّل هذا حسب ORM الذي تستخدمه (Prisma, Mongoose, etc.)
    
    // مثال مع Prisma:
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData
    });
    
    // أو مع Mongoose:
    // const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    
    console.log('✅ تم تحديث المنتج بنجاح');
    
    res.json(updatedProduct);
    
  } catch (error) {
    console.error('❌ خطأ في تحديث المنتج:', error);
    res.status(500).json({ 
      message: error.message || 'حدث خطأ في تحديث المنتج'
    });
  }
});

module.exports = router;
```

---

### الخطوة 5: جعل مجلد uploads متاحاً

في ملف `server.js` أو `app.js` أو `index.js` (الملف الرئيسي):

```javascript
const express = require('express');
const path = require('path');
const app = express();

// ⚠️ أضف هذا السطر قبل باقي الـ routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// باقي الـ middleware والـ routes...
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const productRoutes = require('./routes/productRoutes');
app.use(productRoutes);

// Start server...
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📁 Uploads folder: ${path.join(__dirname, 'uploads')}`);
});
```

---

### الخطوة 6: إزالة أي كود Cloudinary

ابحث في الباك اند عن:
- `cloudinary.config`
- `require('cloudinary')`
- `cloudinary.uploader.upload`

واحذف أو علّق على هذه الأكواد.

---

### الخطوة 7: أعد تشغيل الباك اند

```bash
# أوقف الباك اند (Ctrl+C)
# ثم شغله من جديد:

npm start
# أو
node server.js
# أو
nodemon server.js
```

يجب أن ترى:
```
✅ Server running on port 5000
📁 Uploads folder: C:\path\to\backend\uploads
```

---

## الاختبار

1. **افتح الفرونت اند** (صفحة تعديل منتج)
2. **افتح Console (F12)**
3. **ارفع صورة جديدة واضغط حفظ**
4. **تحقق من**:
   - ✅ في Console: status = 200
   - ✅ في Console: response يحتوي على `images` array
   - ✅ في مجلد `uploads`: يوجد ملف الصورة الجديد
   - ✅ الصورة تظهر في الفرونت اند

---

## استكشاف الأخطاء

### المشكلة: "Cannot read property 'files' of undefined"
**الحل**: تأكد من إضافة multer middleware في الـ route:
```javascript
router.put('/api/products/:id', upload.array('images', 5), ...)
```

### المشكلة: "Multer unexpected field"
**الحل**: تأكد من أن اسم الحقل في الفرونت اند هو `'images'`:
```javascript
selectedFiles.forEach(file => data.append('images', file));
```

### المشكلة: الصورة لا تظهر
**الحل**: تأكد من:
1. مجلد `uploads` موجود في الباك اند
2. `app.use('/uploads', express.static('uploads'))` موجود
3. الباك اند يرد بمسارات الصور: `/uploads/product-123456.jpg`

### المشكلة: "CORS error"
**الحل**: أضف CORS middleware:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3000', // أو رابط الفرونت اند
  credentials: true
}));
```

---

## بنية المشروع النهائية

```
backend/
├── server.js (أو app.js)
├── config/
│   └── multer.js          ← ملف جديد
├── routes/
│   └── productRoutes.js   ← معدّل
├── uploads/               ← مجلد جديد
│   ├── product-1234567.jpg
│   ├── product-1234568.png
│   └── ...
└── package.json
```

---

## ملاحظات مهمة ⚠️

### الأمان:
- ✅ نستخدم `fileFilter` لقبول الصور فقط
- ✅ حد أقصى 5MB للصورة
- ✅ أسماء ملفات فريدة لتجنب الكتابة فوق صور قديمة

### الأداء:
- ⚠️ الصور على السيرفر مباشرة (قد تشغل مساحة)
- ✅ سريعة لأنها محلية
- ⚠️ تحتاج backup منتظم

### للإنتاج (Production):
- فكّر في استخدام CDN مثل:
  - AWS S3 (يعمل في معظم الدول)
  - DigitalOcean Spaces
  - Backblaze B2
  - أو أي CDN محلي في بلدك

---

## الآن جرّب!

1. تأكد من تطبيق كل الخطوات
2. أعد تشغيل الباك اند
3. ارفع صورة من الفرونت اند
4. راقب Console في الباك اند والفرونت اند

**يجب أن يعمل الآن! 🎉**

إذا واجهت أي مشكلة، أخبرني بالضبط ما يظهر في Console!

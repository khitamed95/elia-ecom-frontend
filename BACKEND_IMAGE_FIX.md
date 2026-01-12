# إصلاح مشكلة الصور في الباك-إند

## المشكلة
الباك-إند يحفظ `undefined` بدلاً من أسماء الملفات الفعلية:
```json
"image": "http://192.168.1.158:5000/uploads/undefined"
```

## الحل

### 1. تحديث كود رفع الصور في الباك-إند

في ملف المنتجات (مثل `productController.js` أو `productRoutes.js`)، ابحث عن كود رفع الصور وتأكد أنه يحفظ اسم الملف بشكل صحيح:

```javascript
// ❌ خطأ - لا يحفظ اسم الملف
const newProduct = {
    name: req.body.name,
    image: req.file.path,  // هذا يحفظ المسار الكامل
    // ...
};

// ✅ صحيح - يحفظ اسم الملف فقط
const newProduct = {
    name: req.body.name,
    image: req.file ? req.file.filename : null,  // اسم الملف فقط
    // أو
    image: req.file ? `/uploads/${req.file.filename}` : null,
    // ...
};
```

### 2. تأكد من إعدادات Multer

```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // المجلد
    },
    filename: (req, file, cb) => {
        // اسم ملف فريد
        const uniqueName = `product-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage: storage });
```

### 3. تأكد من خدمة الملفات الثابتة

```javascript
const express = require('express');
const app = express();

// خدمة الملفات من مجلد uploads
app.use('/uploads', express.static('uploads'));
```

### 4. عند إنشاء منتج جديد

```javascript
router.post('/products', upload.single('image'), async (req, res) => {
    try {
        const productData = {
            name: req.body.name,
            price: req.body.price,
            description: req.body.description,
            // ✅ الطريقة الصحيحة
            image: req.file ? `/uploads/${req.file.filename}` : null,
            // أو
            image: req.file ? req.file.filename : null,
        };
        
        const product = await Product.create(productData);
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### 5. إصلاح المنتجات الموجودة في قاعدة البيانات

إذا كانت المنتجات الموجودة بالفعل تحتوي على `undefined`، احذفها وأنشئها من جديد، أو استخدم سكريبت لتحديثها:

```javascript
// سكريبت لتنظيف قاعدة البيانات
const { Product } = require('./models');

async function fixProducts() {
    const products = await Product.findAll();
    
    for (const product of products) {
        if (!product.image || product.image.includes('undefined')) {
            // إما تحذف المنتج
            await product.destroy();
            // أو تضع صورة افتراضية
            // product.image = null;
            // await product.save();
        }
    }
    
    console.log('✅ Products fixed!');
}

fixProducts();
```

## اختبار الإصلاح

بعد تطبيق الإصلاح، جرّب إنشاء منتج جديد وتأكد أن الصورة تُحفظ بشكل صحيح:

```bash
# طلب POST لإنشاء منتج جديد مع صورة
POST http://192.168.1.158:5000/api/products
Content-Type: multipart/form-data

{
    "name": "منتج تجريبي",
    "price": 50000,
    "image": [file upload]
}

# يجب أن تكون الاستجابة:
{
    "id": "...",
    "name": "منتج تجريبي",
    "image": "/uploads/product-1736641234567-123456789.jpg"
}
```

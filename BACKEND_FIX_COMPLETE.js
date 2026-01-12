/**
 * سكريبت إصلاح كود رفع الصور في الباك-إند
 * 
 * المشكلة: الباك-إند يحفظ "undefined" بدلاً من أسماء الملفات
 * الحل: تعديل كود رفع الصور لحفظ req.file.filename بدلاً من req.file.path
 */

// ==========================================
// 1️⃣ إعدادات Multer الصحيحة
// ==========================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// إنشاء مجلد uploads إذا لم يكن موجوداً
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// إعداد التخزين
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // إنشاء اسم ملف فريد
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix + ext);
    }
});

// فلتر أنواع الملفات المسموح بها
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('يسمح فقط بملفات الصور (jpg, png, gif, webp)'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // حد أقصى 5MB
    fileFilter: fileFilter
});

// ==========================================
// 2️⃣ Route لإنشاء منتج جديد (مع صورة)
// ==========================================

router.post('/products', upload.single('image'), async (req, res) => {
    try {
        const { name, price, description, category, availableSizes } = req.body;
        
        // ✅ الطريقة الصحيحة: حفظ اسم الملف فقط
        const imageFilename = req.file ? req.file.filename : null;
        
        // إنشاء المنتج في قاعدة البيانات
        const product = await Product.create({
            id: uuid(), // أو أي طريقة لإنشاء ID
            name,
            price: parseFloat(price),
            description,
            category,
            image: imageFilename, // ✅ حفظ اسم الملف فقط
            availableSizes: Array.isArray(availableSizes) 
                ? availableSizes 
                : (availableSizes ? JSON.parse(availableSizes) : [])
        });
        
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ 
            message: 'خطأ في إنشاء المنتج',
            error: error.message 
        });
    }
});

// ==========================================
// 3️⃣ Middleware لمعالجة الصور عند الإرجاع
// ==========================================

// إضافة middleware لتحويل أسماء الملفات إلى روابط كاملة
const withAbsoluteUrls = (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function(data) {
        if (data) {
            // معالجة منتج واحد
            if (data.image && !data.image.startsWith('http')) {
                data.image = `http://${req.get('host')}/uploads/${data.image}`;
            }
            
            // معالجة مصفوفة منتجات
            if (Array.isArray(data)) {
                data = data.map(item => {
                    if (item.image && !item.image.startsWith('http')) {
                        item.image = `http://${req.get('host')}/uploads/${item.image}`;
                    }
                    return item;
                });
            }
        }
        
        return originalJson(data);
    };
    
    next();
};

// استخدام الـ middleware على routes المنتجات
router.use('/products', withAbsoluteUrls);

// ==========================================
// 4️⃣ خدمة الملفات الثابتة
// ==========================================

const express = require('express');
const app = express();

// خدمة ملفات uploads كملفات ثابتة
app.use('/uploads', express.static('uploads'));

// ==========================================
// 5️⃣ سكريبت لإصلاح المنتجات الموجودة
// ==========================================

async function fixExistingProducts() {
    try {
        // احصل على جميع المنتجات
        const products = await Product.findAll();
        
        let fixed = 0;
        let deleted = 0;
        
        for (const product of products) {
            // إذا كانت الصورة تحتوي على "undefined"
            if (!product.image || 
                product.image.includes('undefined') || 
                product.image === 'null') {
                
                // الخيار 1: حذف المنتج
                await product.destroy();
                deleted++;
                
                // أو الخيار 2: تعيين null للصورة
                // product.image = null;
                // await product.save();
                // fixed++;
            }
        }
        
        console.log(`✅ تم حذف ${deleted} منتج بدون صور صحيحة`);
        console.log(`✅ تم إصلاح ${fixed} منتج`);
        
        return { fixed, deleted };
    } catch (error) {
        console.error('❌ خطأ في إصلاح المنتجات:', error);
        throw error;
    }
}

// تشغيل السكريبت (قم بتشغيله مرة واحدة فقط)
// fixExistingProducts();

// ==========================================
// 6️⃣ التصدير
// ==========================================

module.exports = {
    upload,
    withAbsoluteUrls,
    fixExistingProducts
};

// ==========================================
// 📝 تعليمات الاستخدام
// ==========================================

/*
1. انسخ هذا الكود إلى ملف في الباك-إند (مثل: config/upload.js)

2. استورده في routes المنتجات:
   const { upload, withAbsoluteUrls } = require('./config/upload');

3. استخدمه في route إنشاء المنتج:
   router.post('/products', upload.single('image'), async (req, res) => {
       const imageFilename = req.file ? req.file.filename : null;
       // ... باقي الكود
   });

4. أضف middleware لتحويل الروابط:
   router.use('/products', withAbsoluteUrls);

5. لإصلاح المنتجات الموجودة، شغّل:
   node -e "require('./config/upload').fixExistingProducts()"

6. تأكد من وجود:
   app.use('/uploads', express.static('uploads'));
*/

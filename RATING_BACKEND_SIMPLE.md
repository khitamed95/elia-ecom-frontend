# إضافة نظام التقييم في الباك-اند

## الكود المطلوب في الباك-اند

### 1. تحديث Product Model
أضف هذه الحقول في `models/Product.js`:

```javascript
const productSchema = new mongoose.Schema({
    // ... الحقول الموجودة
    
    rating: {
        type: Number,
        default: 0
    },
    ratingCount: {
        type: Number,
        default: 0
    },
    ratingSum: {
        type: Number,
        default: 0
    }
});
```

### 2. إضافة Route للتقييم
أضف في `routes/products.js` أو `routes/productRoutes.js`:

```javascript
// POST /api/products/:id/rate
router.post('/:id/rate', async (req, res) => {
    try {
        const { rating } = req.body;
        
        // التحقق من صحة التقييم
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ 
                message: 'التقييم يجب أن يكون بين 1 و 5' 
            });
        }
        
        // البحث عن المنتج
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ 
                message: 'المنتج غير موجود' 
            });
        }
        
        // تحديث التقييم
        product.ratingSum = (product.ratingSum || 0) + rating;
        product.ratingCount = (product.ratingCount || 0) + 1;
        product.rating = product.ratingSum / product.ratingCount;
        
        await product.save();
        
        res.json({ 
            message: 'تم التقييم بنجاح',
            rating: product.rating,
            ratingCount: product.ratingCount
        });
    } catch (error) {
        console.error('Rating error:', error);
        res.status(500).json({ 
            message: 'خطأ في تقييم المنتج',
            error: error.message 
        });
    }
});
```

## اختبار النظام

بعد إضافة الكود في الباك-اند:

1. أعد تشغيل الباك-اند
2. في الفرونت إند، افتح `app/home-content.js`
3. احذف السطر `return;` من دالة `handleRating`
4. احذف التعليقات `/*` و `*/`

أو ببساطة استبدل الدالة بهذا:

```javascript
const handleRating = async (productId, rating) => {
    try {
        await api.post(`/api/products/${productId}/rate`, { rating });
        toast.success(`تم تقييم المنتج بـ ${rating} نجوم`);
        
        setProducts(prev => prev.map(p => 
            p._id === productId ? { ...p, rating } : p
        ));
        setAllProducts(prev => prev.map(p => 
            p._id === productId ? { ...p, rating } : p
        ));
    } catch (error) {
        console.error('Rating error:', error);
        toast.error(error.response?.data?.message || 'فشل في تقييم المنتج');
    }
};
```

للتفاصيل الكاملة، راجع [RATING_SYSTEM_GUIDE.md](RATING_SYSTEM_GUIDE.md)

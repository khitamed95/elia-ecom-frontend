import prisma from './lib/prisma.js';

// في حال كانت لديك صور فعلية مرفوعة في مجلد uploads على الباكند،
// احرص على أن تكون أسماء الملفات هنا مطابقة لما هو موجود هناك.
// سيحوّل الفرونت أي مسار يبدأ بـ /uploads إلى رابط كامل باستخدام NEXT_PUBLIC_API_URL.
const products = [
    // رجالي
    { name: 'قميص رجالي كاجوال', price: 45000, category: 'رجالي', description: 'قميص قطن 100% مريح وأنيق للاستخدام اليومي', image: '/uploads/product-men-shirt-1.webp', availableSizes: ['S', 'M', 'L', 'XL'], brand: 'ELIA' },
    { name: 'بنطلون جينز رجالي', price: 65000, category: 'رجالي', description: 'جينز عالي الجودة بتصميم عصري', image: '/uploads/product-men-jeans-1.webp', availableSizes: ['30', '32', '34', '36'], brand: 'ELIA' },
    { name: 'جاكيت رياضي رجالي', price: 85000, category: 'رجالي', description: 'جاكيت مقاوم للماء مثالي للرياضة', image: '/uploads/product-men-jacket-1.webp', availableSizes: ['M', 'L', 'XL', 'XXL'], brand: 'ELIA' },
    { name: 'حذاء رياضي رجالي', price: 95000, category: 'أحذية', description: 'حذاء رياضي مريح للمشي والجري', image: '/uploads/product-men-shoes-1.webp', availableSizes: ['40', '41', '42', '43', '44'], brand: 'ELIA' },
    { name: 'بدلة رسمية رجالي', price: 150000, category: 'رجالي', description: 'بدلة أنيقة للمناسبات الرسمية', image: '/uploads/product-men-suit-1.webp', availableSizes: ['M', 'L', 'XL'], brand: 'ELIA' },

    // نسائي
    { name: 'فستان صيفي نسائي', price: 55000, category: 'نسائي', description: 'فستان خفيف وأنيق للصيف', image: '/uploads/product-women-dress-1.webp', availableSizes: ['S', 'M', 'L'], brand: 'ELIA' },
    { name: 'بلوزة نسائية فاخرة', price: 42000, category: 'نسائي', description: 'بلوزة حرير بتصميم راقي', image: '/uploads/product-women-blouse-1.webp', availableSizes: ['S', 'M', 'L', 'XL'], brand: 'ELIA' },
    { name: 'جاكيت جينز نسائي', price: 75000, category: 'نسائي', description: 'جاكيت جينز كلاسيكي بقصة مميزة', image: '/uploads/product-women-jacket-1.webp', availableSizes: ['S', 'M', 'L'], brand: 'ELIA' },
    { name: 'حذاء كعب نسائي', price: 80000, category: 'أحذية', description: 'حذاء كعب عالي أنيق للمناسبات', image: '/uploads/product-women-heels-1.webp', availableSizes: ['36', '37', '38', '39', '40'], brand: 'ELIA' },
    { name: 'حقيبة يد نسائية', price: 65000, category: 'إكسسوارات', description: 'حقيبة جلد طبيعي فاخرة', image: '/uploads/product-women-bag-1.webp', availableSizes: ['واحد'], brand: 'ELIA' },

    // أطفال
    { name: 'تيشيرت أطفال', price: 25000, category: 'أطفال', description: 'تيشيرت قطني مريح للأطفال', image: '/uploads/product-kids-tshirt-1.webp', availableSizes: ['4', '6', '8', '10', '12'], brand: 'ELIA' },
    { name: 'فستان بنات', price: 40000, category: 'أطفال', description: 'فستان جميل للبنات الصغيرات', image: '/uploads/product-kids-dress-1.webp', availableSizes: ['4', '6', '8', '10'], brand: 'ELIA' },
    { name: 'حذاء أطفال رياضي', price: 50000, category: 'أحذية', description: 'حذاء رياضي مريح للأطفال', image: '/uploads/product-kids-shoes-1.webp', availableSizes: ['28', '30', '32', '34'], brand: 'ELIA' },
    { name: 'سترة أطفال شتوية', price: 60000, category: 'أطفال', description: 'سترة دافئة للشتاء', image: '/uploads/product-kids-jacket-1.webp', availableSizes: ['4', '6', '8', '10', '12'], brand: 'ELIA' },

    // إكسسوارات
    { name: 'ساعة يد كلاسيك', price: 95000, category: 'إكسسوارات', description: 'ساعة أنيقة بتصميم عصري', image: '/uploads/product-watch-1.webp', availableSizes: ['واحد'], brand: 'ELIA' },
    { name: 'نظارة شمسية', price: 35000, category: 'إكسسوارات', description: 'نظارة حماية من الشمس بتصميم عصري', image: '/uploads/product-sunglasses-1.webp', availableSizes: ['واحد'], brand: 'ELIA' },
    { name: 'حزام جلد رجالي', price: 28000, category: 'إكسسوارات', description: 'حزام جلد طبيعي فاخر', image: '/uploads/product-belt-1.webp', availableSizes: ['90', '95', '100', '105'], brand: 'ELIA' },
    { name: 'محفظة جلد', price: 32000, category: 'إكسسوارات', description: 'محفظة جلد أنيقة وعملية', image: '/uploads/product-wallet-1.webp', availableSizes: ['واحد'], brand: 'ELIA' },

    // منتجات إضافية
    { name: 'سويتر شتوي', price: 70000, category: 'رجالي', description: 'سويتر صوف دافئ للشتاء', image: '/uploads/product-sweater-1.webp', availableSizes: ['M', 'L', 'XL'], brand: 'ELIA' },
    { name: 'شورت رياضي', price: 30000, category: 'رجالي', description: 'شورت مثالي للرياضة', image: '/uploads/product-shorts-1.webp', availableSizes: ['M', 'L', 'XL'], brand: 'ELIA' },
];

async function seedProducts() {
    console.log(' جاري إضافة المنتجات...\n');

    try {
        const result = await prisma.product.createMany({
            data: products.map((p) => ({
                name: p.name,
                price: p.price,
                description: p.description,
                category: p.category,
                image: p.image || '/placeholder.svg',
                images: [p.image || '/placeholder.svg'],
                brand: p.brand,
                countInStock: 100,
                availableSizes: p.availableSizes,
                isPopular: Math.random() > 0.5,
                userId: null,
            })),
            skipDuplicates: true, // لن يكرر المنتجات إذا كانت موجودة بنفس القيم الفريدة
        });

        console.log(`\n تم إضافة ${result.count} منتج (تم تخطي المتكرر تلقائياً).`);
        console.log('\n ملاحظة: المنتجات ستظهر بصورة placeholder.');
        console.log(' يمكنك تعديل المنتجات وإضافة صور حقيقية من لوحة الإدمن.');
    } catch (error) {
        console.error('\n حدث خطأ أثناء عملية seeding:', error.message);
    }
}

seedProducts()
    .then(() => {
        console.log('\n تمت العملية بنجاح!');
        process.exit(0);
    })
    .catch(err => {
        console.error('\n حدث خطأ:', err);
        process.exit(1);
    });

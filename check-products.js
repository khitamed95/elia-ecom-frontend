import pkg from 'pg';
const { Client } = pkg;

const clientConfig = {
    host: '127.0.0.1',
    port: 5432,
    database: 'db',
    user: 'postgres',
    password: 'qwe'
};

// لا تضيف password إذا كانت فارغة
const client = new Client(clientConfig);

async function checkProducts() {
    try {
        await client.connect();
        console.log('✓ تم الاتصال بقاعدة البيانات\n');

        // 1. الاستعلام عن أول 3 منتجات
        const result = await client.query(
            'SELECT id, name, image, category FROM "Product" LIMIT 3'
        );

        console.log('=== بيانات أول 3 منتجات ===\n');
        const products = result.rows;
        
        let hasImageIssues = false;
        const productData = products.map((product, index) => {
            const hasValidImage = product.image && 
                (product.image.startsWith('http') || 
                 product.image.startsWith('/uploads'));
            
            if (!hasValidImage) {
                hasImageIssues = true;
            }

            return {
                id: product.id,
                name: product.name,
                category: product.category,
                image: product.image || null,
                imageValid: hasValidImage,
                status: !product.image ? '❌ فارغ' : 
                       hasValidImage ? '✓ صحيح' : '⚠️ غير صحيح'
            };
        });

        console.log(JSON.stringify(productData, null, 2));
        console.log('\n=== الملخص ===');
        console.log(`عدد المنتجات: ${products.length}`);
        console.log(`المنتجات بصور صحيحة: ${productData.filter(p => p.imageValid).length}`);
        console.log(`المنتجات بدون صور أو بصور غير صحيحة: ${productData.filter(p => !p.imageValid).length}`);

        // 2. إذا كانت هناك مشاكل في الصور
        if (hasImageIssues) {
            console.log('\n⚠️ تم اكتشاف مشاكل في الصور. جاري التحديث...\n');
            
            // تحديث الصور بقيم افتراضية
            const updateResult = await client.query(
                `UPDATE "Product" 
                 SET image = CASE 
                    WHEN image IS NULL OR image = '' OR image = 'undefined' 
                    THEN 'https://via.placeholder.com/400?text=Product'
                    ELSE image 
                 END
                 WHERE id IN (${products.map(p => p.id).join(',')})
                 RETURNING id, name, image`
            );

            console.log('=== المنتجات بعد التحديث ===\n');
            console.log(JSON.stringify(updateResult.rows, null, 2));
        } else {
            console.log('\n✓ جميع الصور صحيحة!');
        }

    } catch (error) {
        console.error('❌ خطأ:', error.message);
    } finally {
        await client.end();
        console.log('\n✓ تم إغلاق الاتصال');
    }
}

checkProducts();

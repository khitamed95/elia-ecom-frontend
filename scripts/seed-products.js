// سكريبت لإضافة منتجات تجريبية للمتجر (Prisma)
import prisma from '../lib/prisma.js';

async function main() {
  const products = [
    {
      name: 'تيشيرت أطفال قطن',
      price: 15000,
      image: '',
      category: 'ملابس أطفال',
      description: 'تيشيرت قطن عالي الجودة للأعمار 6-7 سنوات',
      isPopular: true
    },
    {
      name: 'حذاء رياضي أطفال',
      price: 22000,
      image: '',
      category: 'أحذية أطفال',
      description: 'حذاء رياضي مريح للأعمار 8-9 سنوات',
      isPopular: false
    },
    {
      name: 'فستان بناتي صيفي',
      price: 35000,
      image: '',
      category: 'ملابس أطفال',
      description: 'فستان صيفي أنيق للأعمار 10-11 سنوات',
      isPopular: true
    },
    {
      name: 'قبعة شمسية',
      price: 8000,
      image: '',
      category: 'إكسسوارات',
      description: 'قبعة لحماية الأطفال من الشمس',
      isPopular: false
    }
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  console.log('✅ تم إضافة المنتجات التجريبية بنجاح');
  process.exit(0);
}

main();

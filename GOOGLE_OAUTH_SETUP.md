# خطوات إعداد Google OAuth

## ✅ تم إكمال - Frontend

1. ✅ تثبيت المكتبات: `npm install @react-oauth/google axios`
2. ✅ إضافة GoogleOAuthProvider في layout.tsx
3. ✅ تحديث صفحات تسجيل الدخول والتسجيل
4. ✅ إعداد متغيرات البيئة (.env.local)

## 📝 الخطوات المتبقية

### 1. إنشاء Google OAuth Credentials

1. اذهب إلى: https://console.cloud.google.com/
2. أنشئ مشروع جديد أو اختر مشروع موجود
3. فعّل **Google+ API** أو **Google Identity**
4. انتقل إلى **APIs & Services** > **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. اختر **Web application**
6. أضف **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `http://localhost:5000`
7. أضف **Authorized redirect URIs**:
   - `http://localhost:3000`
   - `http://localhost:5000/api/users/auth/google/callback`
8. انسخ **Client ID** و **Client Secret**

### 2. تحديث متغيرات البيئة

**في Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE
```

**في Backend (.env):**
```
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
```

### 3. تثبيت المكتبات في Backend

في مجلد Backend:
```bash
cd C:\Users\E-Tech\elia-ecom-backend
npm install axios
```

### 4. إضافة Google OAuth Route في Backend

أنشئ ملف `controllers/authController.js`:

```javascript
import axios from 'axios';
import prisma from '../config/db.js';
import { generateToken } from '../utils/generateToken.js';

// @desc    تسجيل الدخول/التسجيل عبر Google
// @route   POST /api/users/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
    try {
        const { accessToken } = req.body;

        if (!accessToken) {
            return res.status(400).json({ message: 'Access token مطلوب' });
        }

        // الحصول على معلومات المستخدم من Google
        const response = await axios.get(
            `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
        );

        const { email, name, picture } = response.data;

        if (!email) {
            return res.status(400).json({ message: 'لم نتمكن من الحصول على البريد الإلكتروني' });
        }

        // البحث عن المستخدم أو إنشاؤه
        let user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            // إنشاء مستخدم جديد
            user = await prisma.user.create({
                data: {
                    name: name,
                    email: email,
                    avatar: picture,
                    password: null, // لا توجد كلمة مرور للمستخدمين من Google
                    isAdmin: false
                }
            });
        }

        // إنشاء JWT token
        const token = generateToken(user.id);

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            avatar: user.avatar,
            token: token,
            accessToken: token
        });

    } catch (error) {
        console.error('Google Auth Error:', error.response?.data || error.message);
        res.status(401).json({ 
            message: 'فشلت عملية المصادقة عبر Google',
            error: error.response?.data?.error_description || error.message
        });
    }
};
```

### 5. تحديث routes/userRoutes.js

أضف في أعلى الملف:
```javascript
import { googleAuth } from '../controllers/authController.js';
```

أضف هذا الـ route:
```javascript
// Google OAuth
router.post('/auth/google', googleAuth);
```

### 6. تحديث Prisma Schema

في `prisma/schema.prisma`، اجعل password اختيارية:

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  email     String   @unique
  password  String?  // اختيارية للمستخدمين من Google
  avatar    String?
  isAdmin   Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

ثم قم بتشغيل:
```bash
npx prisma migrate dev --name make_password_optional
```

### 7. تشغيل التطبيق

```bash
# Backend
cd C:\Users\E-Tech\elia-ecom-backend
npm start

# Frontend  
cd C:\Users\E-Tech\elia-ecom-frontend
npm run dev
```

## 🎯 ملخص الحالة

✅ **Frontend جاهز بالكامل**
- أزرار Google OAuth تعمل
- معالجة callback جاهزة
- التكامل مع المكتبة كامل

⚠️ **Backend يحتاج إلى:**
1. تثبيت axios
2. إنشاء authController.js
3. إضافة route للـ Google OAuth
4. تحديث Prisma Schema
5. تشغيل migration
6. وضع Google Client ID و Secret في .env

🔑 **لا تنسى:**
- استبدال `YOUR_ACTUAL_CLIENT_ID_HERE` في .env.local بالـ Client ID الحقيقي
- استبدال القيم في .env الخاص بالـ Backend

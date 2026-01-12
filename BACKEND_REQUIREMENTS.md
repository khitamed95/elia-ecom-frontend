# 🔧 متطلبات البياك إند (Backend Requirements)

## 🚨 المشاكل الحالية

### 1. ❌ البياك إند **لا يرسل** `refreshToken`
```javascript
// الحالي (غير صحيح):
{
  id: "123",
  email: "user@...",
  accessToken: "eyJ..."  // ❌ فقط accessToken
}

// يجب أن يكون (صحيح):
{
  id: "123",
  email: "user@...",
  accessToken: "eyJ...",  // ✅ accessToken
  refreshToken: "eyJ..."  // ✅ refreshToken
}
```

---

## ✅ الحل المطلوب في البياك إند

### 1. عند endpoint `/users/login` أو `/users/register`

```javascript
// Response يجب أن يتضمن:
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "role": "user" or "admin",
  "accessToken": "jwt-access-token-here",
  "refreshToken": "jwt-refresh-token-here",  // 🔑 مهم جداً!
  "token": "jwt-access-token-here"  // اختياري (نسخة من accessToken)
}
```

### 2. عند endpoint `/users/refresh-token`

```javascript
// Request:
POST /api/users/refresh-token
Body: {
  "refreshToken": "jwt-refresh-token-here"
}

// Response:
{
  "accessToken": "new-jwt-access-token",
  "refreshToken": "new-jwt-refresh-token"  // اختياري
}
```

---

## 📝 التعديلات المطلوبة في Backend

### في ملف `userRoutes.js` أو `authRoutes.js`:

```javascript
// 1. في endpoint التسجيل (Register)
router.post('/register', async (req, res) => {
  // ... كود التحقق والإنشاء ...
  
  const accessToken = jwt.sign({id: user.id, email: user.email}, SECRET, {expiresIn: '1h'});
  const refreshToken = jwt.sign({id: user.id}, REFRESH_SECRET, {expiresIn: '7d'});
  
  // ✅ تخزين refreshToken في قاعدة البيانات (اختياري لكن مهم)
  await User.update({id: user.id}, {refreshToken});
  
  // ✅ إرسال كلا التوكنين
  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    accessToken,    // ✅ مهم
    refreshToken,   // ✅ مهم
    token: accessToken
  });
});

// 2. في endpoint تجديد الجلسة (Refresh)
router.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({message: 'Refresh token required'});
  }
  
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    
    // ✅ تحقق من أن refreshToken متطابق في DB (اختياري)
    if (user.refreshToken !== refreshToken) {
      throw new Error('Token mismatch');
    }
    
    // ✅ إنشاء token جديد
    const newAccessToken = jwt.sign({id: user.id, email: user.email}, SECRET, {expiresIn: '1h'});
    
    res.json({
      accessToken: newAccessToken,
      token: newAccessToken
    });
  } catch (error) {
    res.status(401).json({message: 'Invalid refresh token'});
  }
});
```

---

## 🔒 ملاحظات أمان مهمة

1. **مدة صلاحية التوكن:**
   - `accessToken`: 15 دقيقة - 1 ساعة
   - `refreshToken`: 7 أيام - 30 يوم

2. **تخزين الـ tokens:**
   - ✅ Frontend: في `localStorage` (حالياً)
   - ✅ Backend: احفظ `refreshToken` في database كـ backup

3. **Security headers:**
   ```javascript
   // أضف هذا في middleware
   res.set('Cache-Control', 'no-store');
   res.set('Pragma', 'no-cache');
   ```

---

## 🧪 الاختبار

### 1. اختبر التسجيل:
```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@elia.com",
    "password": "Admin@123",
    "phoneNumber": "07700000000"
  }'
```

**التوقع:** يجب أن يرسل `accessToken` + `refreshToken`

### 2. اختبر تجديد الجلسة:
```bash
curl -X POST http://localhost:5000/api/users/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "مكان-refresh-token-الذي-حصلت-عليه"
  }'
```

**التوقع:** يجب أن يرسل `accessToken` جديد

---

## 📌 الملفات المتأثرة في Frontend

بعد تعديل Backend، هذه الملفات ستعمل تلقائياً:

- ✅ `lib/axios.js` - Interceptor للتحديث التلقائي
- ✅ `app/login/page.js` - تسجيل الدخول
- ✅ `app/register/page.js` - إنشاء حساب جديد
- ✅ `app/contact/page.js` - نموذج التواصل
- ✅ `app/admin/page.js` - لوحة التحكم

---

## 🎯 الخطوات التالية

1. **عدّل Backend** ليرسل `refreshToken`
2. **اختبر endpoints** بـ Postman أو curl
3. **عد للفرونتند** وجرب التسجيل مرة أخرى
4. **استخدم `/token-debug`** لفحص الجلسة

---

**ملاحظة:** بدون هذه التعديلات في Backend، نظام التحديث التلقائي للجلسة لن يعمل بشكل صحيح.

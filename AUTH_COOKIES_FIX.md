# 🔐 إصلاح نظام المصادقة - Cookies Support

## ✅ ما تم إصلاحه

تم تحديث نظام المصادقة لدعم **Server Components** من خلال حفظ التوكن في:
1. ✅ **localStorage** - للتوافق مع الكود القديم
2. ✅ **Cookies** - للـ Server Components والـ proxy.js

---

## 📝 الملفات المحدثة

### 1. صفحة تسجيل الدخول ([app/login/page.js](app/login/page.js))
```javascript
// حفظ في localStorage
localStorage.setItem('userInfo', JSON.stringify(data));

// حفظ في Cookies للـ Server Components
const token = data.accessToken || data.token;
document.cookie = `accessToken=${token}; path=/; max-age=2592000; SameSite=Strict`;
document.cookie = `userInfo=${encodeURIComponent(JSON.stringify(data))}; path=/; max-age=2592000; SameSite=Strict`;
```

### 2. صفحة التسجيل ([app/register/page.js](app/register/page.js))
- نفس الطريقة - حفظ في localStorage + Cookies

### 3. تسجيل الخروج
**في Header.js:**
```javascript
// حذف من localStorage
localStorage.removeItem('userInfo');

// حذف من Cookies
document.cookie = 'accessToken=; path=/; max-age=0';
document.cookie = 'userInfo=; path=/; max-age=0';
```

**في profile-client.js:**
```javascript
localStorage.clear();
document.cookie = 'accessToken=; path=/; max-age=0';
document.cookie = 'userInfo=; path=/; max-age=0';
```

---

## 🔍 كيف يعمل الآن

### عند تسجيل الدخول:
1. المستخدم يدخل البريد وكلمة المرور
2. البيانات تُرسل للـ Backend
3. Backend يرجع `{ accessToken, name, email, isAdmin, ... }`
4. **Frontend يحفظ في:**
   - `localStorage.userInfo` ← للتوافق مع الكود القديم
   - `document.cookie.accessToken` ← للـ proxy.js
   - `document.cookie.userInfo` ← لمعلومات المستخدم

### عند الدخول لصفحة محمية:
1. `proxy.js` يتحقق من **Cookies** (ليس localStorage!)
2. إذا وجد `accessToken` في الـ cookie → يسمح بالدخول
3. إذا كانت الصفحة Admin → يتحقق من `userInfo.isAdmin`
4. إذا لم يجد التوكن → يعيد التوجيه لـ `/login`

### عند تسجيل الخروج:
1. حذف من localStorage
2. حذف من Cookies
3. إعادة التوجيه لـ `/login`

---

## 🧪 الاختبار

### اختبار تسجيل الدخول:
```bash
1. افتح http://localhost:3000/login
2. سجل دخول بحساب عادي
3. يجب أن تُعاد للصفحة الرئيسية "/"

4. افتح DevTools > Application > Cookies
5. يجب أن ترى:
   - accessToken = "eyJhbGc..."
   - userInfo = "%7B%22id%22..."
```

### اختبار Admin:
```bash
1. سجل دخول بحساب Admin
2. يجب أن تُعاد لـ "/admin"

3. افتح http://localhost:3000/admin/products
4. يجب أن تدخل بدون مشاكل
```

### اختبار الحماية:
```bash
1. سجل خروج
2. حاول الدخول لـ "/profile"
3. يجب أن يعيدك لـ "/login?redirect=/profile"
```

---

## 🐛 حل المشاكل

### المشكلة: "الصفحة واقفة في تسجيل الدخول"
**السبب:** Cookies لم تُحفظ أو proxy.js لا يقرأها
**الحل:** 
- تحقق من DevTools > Application > Cookies
- إذا لم تجد `accessToken` → المشكلة في حفظ الـ cookie
- إذا وجدتها → المشكلة في `proxy.js`

### المشكلة: "Admin لا يصل للوحة التحكم"
**السبب:** `userInfo.isAdmin` غير محفوظ في الـ cookie
**الحل:**
```javascript
// تحقق من أن Backend يرجع isAdmin
console.log(data); // يجب أن يحتوي على isAdmin: true
```

### المشكلة: "تسجيل الخروج لا يعمل"
**السبب:** Cookies لم تُحذف
**الحل:**
```javascript
// تحقق من أن الكود يحذف الـ cookies
document.cookie = 'accessToken=; path=/; max-age=0';
document.cookie = 'userInfo=; path=/; max-age=0';
```

---

## 📖 المراجع

- [Next.js Cookies](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [proxy.js Documentation](https://nextjs.org/docs/messages/middleware-to-proxy)
- [SameSite Cookies](https://web.dev/samesite-cookies-explained/)

---

**آخر تحديث:** January 12, 2026  
**الحالة:** ✅ جاهز للاختبار

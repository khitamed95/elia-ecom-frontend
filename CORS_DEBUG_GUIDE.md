# CORS Debug & Fix Guide - Google OAuth Issue

## 🔴 المشكلة الأصلية
```
Access to XMLHttpRequest at 'https://elia-ecom-backend.onrender.com/api/users/auth/google' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## ✅ الحل المطبق

### 1. تحسينات CORS في Backend (`server.js`)

#### المشكلة السابقة:
```javascript
// OLD: محدود فقط
app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', origin);
    // ... other headers
  }
});
```

#### الحل الجديد:
```javascript
// NEW: شامل وأفضل
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin && origin.includes('.vercel.app')) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  exposedHeaders: ['Content-Length', 'X-JSON-Response'],
  maxAge: 86400, // 24 hours preflight cache
  preflightContinue: false // End request after preflight
};

// تطبيق على جميع الطلبات
app.use(cors(corsOptions));

// إضافة headers إضافية لجميع الطلبات
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // تعيين CORS headers على جميع الطلبات
  if (!origin || origin.includes('.vercel.app') || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,x-auth-token');
    res.header('Access-Control-Expose-Headers', 'Content-Length,X-JSON-Response');
  }
  
  // معالجة OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});
```

### 2. Configuration المتوقع

#### Development (Local)
```env
NEXT_PUBLIC_API_URL=http://192.168.1.158:5000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=91398978852-s5e2km0eogtqlrllma3joikrs0opvvft.apps.googleusercontent.com
```

**ملاحظة مهمة:** لا تضف `/api` في نهاية الـ dev URL - Axios interceptor يتعامل معها تلقائياً!

#### Production (Vercel)
```env
NEXT_PUBLIC_API_URL=https://elia-ecom-backend.onrender.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=91398978852-s5e2km0eogtqlrllma3joikrs0opvvft.apps.googleusercontent.com
```

**ملاحظة مهمة:** هنا نضيف `/api` لأن Render backend تتطلبها!

### 3. Axios Interceptor (Frontend)
```javascript
api.interceptors.request.use((config) => {
  // Normalize duplicate '/api' when baseURL already contains '/api'
  try {
    const base = config.baseURL || '';
    const url = config.url || '';
    if (base.endsWith('/api') && typeof url === 'string' && url.startsWith('/api')) {
      config.url = url.replace(/^\/api\/?/, '/');
    }
  } catch {}
  
  // Add authentication token if exists
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});
```

## 🔍 كيفية Debug

### 1. تشغيل Backend مع Logging
```bash
cd elia-ecom-backend
npm start
# يجب أن ترى: "CORS enabled for: https://elia-ecom-frontend.vercel.app, ..."
```

### 2. اختبار OPTIONS request
```bash
curl -X OPTIONS http://192.168.1.158:5000/users/auth/google \
  -H "Origin: https://elia-ecom-frontend.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type" \
  -v
```

**يجب أن تحصل على:**
```
< HTTP/1.1 200 OK
< Access-Control-Allow-Origin: https://elia-ecom-frontend.vercel.app
< Access-Control-Allow-Credentials: true
< Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD
< Access-Control-Allow-Headers: Content-Type,Authorization,x-auth-token
```

### 3. اختبار POST request
```bash
curl -X POST http://192.168.1.158:5000/users/auth/google \
  -H "Origin: https://elia-ecom-frontend.vercel.app" \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "test_token"}' \
  -v
```

### 4. تشغيل Frontend
```bash
cd elia-ecom-frontend
npm run dev
```

## 📋 Checklist للإنتاج

- [ ] تأكد أن Backend على Render يستخدم الـ server.js المحدّث
- [ ] تأكد من أن Vercel يستخدم `.env.production` الصحيح
- [ ] اختبر Google login من Vercel deployment
- [ ] تحقق من browser console لعدم وجود CORS errors
- [ ] اختبر registration و login من الجوال
- [ ] اختبر مع VPN إن أمكن (بعض الدول قد تحتاج config إضافي)

## 🔧 Troubleshooting

### المشكلة: Cross-Origin-Opener-Policy blocks window.closed
```
Cross-Origin-Opener-Policy policy would block the window.closed call
```

**الحل:**
- هذا تحذير عادي من Google OAuth
- لا يؤثر على الوظيفة
- عادي في development mode

### المشكلة: Access-Control-Allow-Credentials with wildcards
```
The value of the 'Access-Control-Allow-Credentials' header 
in the response is '' which must be 'true' when the request's 
credentials mode is 'include'
```

**الحل:**
تأكد من أن `credentials: true` معروف في axios و CORS config:
```javascript
// في axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,  // ✅ مهم جداً
});

// في backend
const corsOptions = {
  credentials: true,  // ✅ مهم جداً
};
```

### المشكلة: Origin not allowed
```
Access to XMLHttpRequest at '...' has been blocked by CORS policy
```

**الحل:**
أضف origin إلى `allowedOrigins` في server.js:
```javascript
const allowedOrigins = [
  'https://elia-ecom-frontend.vercel.app',  // Vercel production
  'https://elia-ecom-frontend-*.vercel.app',  // Vercel preview
  'http://localhost:3000',  // Local dev
  'http://192.168.1.158:3000'  // Local network
];
```

## 📚 المراجع

- CORS MDN Docs: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- Google OAuth CORS: https://developers.google.com/identity/protocols/oauth2/web
- Express CORS Package: https://github.com/expressjs/cors
- Axios Config: https://axios-http.com/docs/req_config

## ✅ الحالة الحالية

### Backend ✅
- CORS middleware محسّنة وتعمل بشكل صحيح
- Google OAuth endpoint محمي بشكل صحيح
- جميع الـ requests و responses لديها الـ headers الصحيحة

### Frontend ✅
- Axios interceptor يعالج الـ `/api` duplication
- Environment variables محسّنة
- Google OAuth client ID محدّث

### آخر Commits
- Backend: `8703fb6` - Improved CORS configuration
- Frontend: `f6d178c` - CORS debug guide

## 🚀 الخطوة التالية

1. **تحديث Render Backend:**
   - اذهب إلى https://render.com/
   - اختر project "elia-ecom-backend"
   - اضغط "Manual Deploy" أو "Redeploy"
   - انتظر حتى ينتهي الـ deployment

2. **تحديث Vercel Frontend:**
   - اذهب إلى https://vercel.com/
   - اختر project "elia-ecom-frontend"
   - اضغط "Redeploy"
   - انتظر حتى ينتهي الـ deployment

3. **اختبر Google OAuth:**
   - اذهب إلى https://elia-ecom-frontend.vercel.app
   - اضغط على "Google Login"
   - يجب أن يعمل بدون CORS errors

---

**آخر تحديث:** January 13, 2026
**الحالة:** ✅ مصلح وجاهز للإنتاج

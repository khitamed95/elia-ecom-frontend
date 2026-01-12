# 🔔 نظام الإشعارات - دليل شامل

## نظرة عامة
تم تطبيق نظام إشعارات كامل يسمح للمستخدمين بتلقي تنبيهات حول:
- ✅ الردود على رسائل التواصل
- ✅ تحديثات الطلبات
- ✅ إشعارات المنتجات
- ✅ إشعارات عامة

---

## 🗄️ قاعدة البيانات (Database)

### نموذج Notification في Prisma Schema

```prisma
model Notification {
  id        Int      @id @default(autoincrement())
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      String   // "order", "message_reply", "product", "general"
  title     String
  message   String   @db.Text
  isRead    Boolean  @default(false)
  link      String?  // Optional link to related page
  relatedId String?  // ID of related order/message/product
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### إضافة العلاقة في User Model

```prisma
model User {
  // ... الحقول الموجودة
  notifications Notification[]
}
```

### تطبيق التغييرات

```bash
cd C:\Users\E-Tech\elia-ecom-backend
npx prisma db push
npx prisma generate
```

---

## 🔧 Backend API

### 📁 Structure

```
backend/
├── controllers/
│   └── notificationController.js    ✅ تم الإنشاء
├── routes/
│   └── notificationRoutes.js        ✅ تم الإنشاء
└── server.js                         ✅ تم التحديث
```

### 🎯 API Endpoints

#### 1. GET `/api/notifications`
**الوصف:** جلب جميع إشعارات المستخدم  
**الحماية:** مطلوب تسجيل دخول (protect middleware)  
**الاستجابة:**
```json
{
  "notifications": [
    {
      "id": 1,
      "userId": 5,
      "type": "message_reply",
      "title": "رد على رسالتك",
      "message": "تم الرد على رسالتك بخصوص: استفسار عن المنتج",
      "isRead": false,
      "link": "/profile/messages",
      "relatedId": "12",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "unreadCount": 3
}
```

#### 2. PATCH `/api/notifications/:id/read`
**الوصف:** تحديد إشعار معين كمقروء  
**الحماية:** مطلوب تسجيل دخول  
**المعاملات:** `id` (notification ID)  
**الاستجابة:**
```json
{
  "id": 1,
  "userId": 5,
  "isRead": true,
  ...
}
```

#### 3. PATCH `/api/notifications/read-all`
**الوصف:** تحديد جميع الإشعارات كمقروءة  
**الحماية:** مطلوب تسجيل دخول  
**الاستجابة:**
```json
{
  "message": "تم تحديث جميع الإشعارات",
  "count": 5
}
```

#### 4. DELETE `/api/notifications/:id`
**الوصف:** حذف إشعار معين  
**الحماية:** مطلوب تسجيل دخول  
**المعاملات:** `id` (notification ID)  
**الاستجابة:**
```json
{
  "message": "تم حذف الإشعار بنجاح"
}
```

#### 5. DELETE `/api/notifications/read`
**الوصف:** حذف جميع الإشعارات المقروءة  
**الحماية:** مطلوب تسجيل دخول  
**الاستجابة:**
```json
{
  "message": "تم حذف جميع الإشعارات المقروءة",
  "count": 3
}
```

---

## 📝 Backend Controller

### `notificationController.js`

```javascript
import prisma from '../lib/prisma.js';

// Helper function لإنشاء إشعار جديد
export const createNotification = async (userId, type, title, message, link = null, relatedId = null) => {
  try {
    const notification = await prisma.notification.create({
      data: { userId, type, title, message, link, relatedId }
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};
```

### استخدام createNotification في Controllers أخرى

#### مثال: في `contactController.js`

```javascript
import { createNotification } from './notificationController.js';

export const replyContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { message: replyMessage } = req.body;

    // الحصول على الرسالة
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });

    // تحديث الرسالة
    const updated = await prisma.contactMessage.update({
      where: { id: parseInt(id) },
      data: {
        reply: replyMessage,
        status: 'replied',
        replyDate: new Date()
      }
    });

    // 🔔 إنشاء إشعار للمستخدم
    if (contactMessage.userId) {
      await createNotification(
        contactMessage.userId,
        'message_reply',
        'رد على رسالتك',
        `تم الرد على رسالتك بخصوص: ${contactMessage.subject}`,
        '/profile/messages',
        id.toString()
      );
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ', error: error.message });
  }
};
```

---

## 🎨 Frontend Implementation

### 📁 Structure

```
frontend/
├── app/
│   └── notifications/
│       └── page.js              ✅ تم الإنشاء
├── components/
│   └── Header.js                ✅ تم التحديث
└── lib/
    └── auth-helper.js           ✅ موجود مسبقاً
```

### 🔔 Bell Icon في Header

**الموقع:** `components/Header.js`

**المميزات:**
- ✅ عرض أيقونة الجرس فقط للمستخدمين المسجلين
- ✅ عرض badge أحمر مع عدد الإشعارات غير المقروءة
- ✅ تأثير animate-pulse للإشعارات الجديدة
- ✅ تحديث تلقائي عند تسجيل الدخول

**الكود:**
```jsx
import { Bell } from 'lucide-react';

const [unreadCount, setUnreadCount] = useState(0);

// Fetch notifications count
useEffect(() => {
  if (userInfo) {
    fetchNotificationsCount();
  }
}, [userInfo]);

const fetchNotificationsCount = async () => {
  try {
    const response = await fetch(`${API_URL}/api/notifications`, {
      headers: {
        'Authorization': `Bearer ${userInfo?.accessToken}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      setUnreadCount(data.unreadCount || 0);
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
};

// في JSX
{userInfo && (
  <Link href="/notifications" passHref>
    <div className="relative text-gray-700 hover:text-indigo-600 transition duration-150 cursor-pointer flex items-center">
      <Bell size={24} />
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
          {unreadCount}
        </span>
      )}
    </div>
  </Link>
)}
```

---

## 📄 صفحة الإشعارات

**الموقع:** `app/notifications/page.js`

### المميزات

#### 1. عرض الإشعارات
- ✅ قائمة كاملة بجميع الإشعارات (مرتبة من الأحدث للأقدم)
- ✅ تمييز الإشعارات غير المقروءة بـ border أزرق
- ✅ badge "جديد" للإشعارات غير المقروءة
- ✅ animate-pulse للأيقونات الجديدة

#### 2. الأيقونات حسب النوع
```javascript
const getNotificationIcon = (type) => {
  switch (type) {
    case 'message_reply':
      return <Bell className="text-blue-500" size={24} />;
    case 'order':
      return <Bell className="text-green-500" size={24} />;
    case 'product':
      return <Bell className="text-purple-500" size={24} />;
    default:
      return <Bell className="text-gray-500" size={24} />;
  }
};
```

#### 3. عرض التاريخ بشكل ذكي
```javascript
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  
  return date.toLocaleDateString('ar-EG');
};
```

#### 4. الإجراءات
- ✅ **تحديد كمقروء:** زر ✓ أخضر لكل إشعار
- ✅ **حذف:** زر ✗ أحمر لكل إشعار
- ✅ **تحديد الكل كمقروء:** زر في الأعلى (يظهر عند وجود إشعارات غير مقروءة)
- ✅ **حذف المقروءة:** زر في الأعلى (يظهر عند وجود إشعارات مقروءة)
- ✅ **عرض التفاصيل:** زر أزرق يوجه للصفحة المرتبطة (إذا كان link موجود)

#### 5. الحالة الفارغة
```jsx
{notifications.length === 0 && (
  <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
    <BellOff className="mx-auto text-gray-300 mb-4" size={64} />
    <h2 className="text-2xl font-bold text-gray-700 mb-2">لا توجد إشعارات</h2>
    <p className="text-gray-500">ستظهر إشعاراتك هنا عندما تتلقى أي تحديثات</p>
    <Link href="/">
      <button className="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition">
        العودة للرئيسية
      </button>
    </Link>
  </div>
)}
```

---

## 🔐 الأمان (Security)

### الحماية
1. ✅ جميع endpoints محمية بـ `protect` middleware
2. ✅ التحقق من ملكية الإشعار قبل التحديث/الحذف
3. ✅ استخدام JWT tokens للمصادقة
4. ✅ Cascade delete (حذف إشعارات المستخدم عند حذف الحساب)

### التحقق من الأذونات
```javascript
// في markAsRead و deleteNotification
if (notification.userId !== req.user.id) {
  return res.status(403).json({ 
    message: 'غير مصرح لك بالوصول لهذا الإشعار' 
  });
}
```

---

## 🎯 حالات الاستخدام (Use Cases)

### 1. إشعار الرد على رسالة تواصل
**المتطلب:** عندما يرد الأدمن على رسالة في نظام Contact Messages

**التطبيق:**
```javascript
// في contactController.js > replyContact
await createNotification(
  contactMessage.userId,
  'message_reply',
  'رد على رسالتك',
  `تم الرد على رسالتك بخصوص: ${contactMessage.subject}`,
  '/profile/messages',
  id.toString()
);
```

### 2. إشعار تحديث حالة الطلب
**المتطلب:** عندما يتم تحديث حالة طلب المستخدم

**مثال التطبيق:**
```javascript
// في orderController.js > updateOrderStatus
import { createNotification } from '../controllers/notificationController.js';

export const updateOrderStatus = async (req, res) => {
  // ... كود التحديث
  
  await createNotification(
    order.userId,
    'order',
    'تحديث حالة الطلب',
    `تم تحديث حالة طلبك #${order.id} إلى: ${newStatus}`,
    `/profile/orders/${order.id}`,
    order.id.toString()
  );
};
```

### 3. إشعار منتج جديد
**المتطلب:** إشعار جماعي لجميع المستخدمين عند إضافة منتج جديد

**مثال التطبيق:**
```javascript
// في productController.js > createProduct
const users = await prisma.user.findMany();

for (const user of users) {
  await createNotification(
    user.id,
    'product',
    'منتج جديد في المتجر',
    `تم إضافة منتج جديد: ${product.name}`,
    `/product/${product.id}`,
    product.id.toString()
  );
}
```

### 4. إشعار عام من الأدمن
**المتطلب:** broadcast notification لجميع المستخدمين

**مثال التطبيق:**
```javascript
// إنشاء endpoint جديد في notificationController
export const sendBroadcast = async (req, res) => {
  const { title, message, link } = req.body;
  
  const users = await prisma.user.findMany();
  
  for (const user of users) {
    await createNotification(
      user.id,
      'general',
      title,
      message,
      link || null,
      null
    );
  }
  
  res.json({ message: 'تم إرسال الإشعار لجميع المستخدمين' });
};
```

---

## 🚀 الاختبار (Testing)

### 1. اختبار إنشاء إشعار
```bash
# من خلال الرد على رسالة تواصل
POST http://192.168.1.158:5000/api/contact/1/reply
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "message": "شكراً على تواصلك معنا"
}
```

### 2. اختبار جلب الإشعارات
```bash
GET http://192.168.1.158:5000/api/notifications
Authorization: Bearer YOUR_USER_TOKEN
```

### 3. اختبار تحديد كمقروء
```bash
PATCH http://192.168.1.158:5000/api/notifications/1/read
Authorization: Bearer YOUR_USER_TOKEN
```

### 4. اختبار حذف إشعار
```bash
DELETE http://192.168.1.158:5000/api/notifications/1
Authorization: Bearer YOUR_USER_TOKEN
```

---

## 📊 قاعدة البيانات

### جدول Notification

| Column    | Type      | Description                           |
|-----------|-----------|---------------------------------------|
| id        | Int       | Primary Key (Auto Increment)          |
| userId    | Int       | Foreign Key → User.id                 |
| type      | String    | نوع الإشعار (order, message_reply,...)  |
| title     | String    | عنوان الإشعار                          |
| message   | Text      | نص الإشعار                            |
| isRead    | Boolean   | هل تم قراءته؟ (default: false)        |
| link      | String?   | رابط للصفحة المرتبطة (اختياري)         |
| relatedId | String?   | ID للعنصر المرتبط (اختياري)            |
| createdAt | DateTime  | تاريخ الإنشاء                         |
| updatedAt | DateTime  | تاريخ آخر تحديث                       |

---

## 🎨 UI/UX Features

### التصميم
- ✅ **Responsive:** يعمل على جميع الأحجام
- ✅ **RTL Support:** دعم كامل للعربية
- ✅ **Modern Design:** تصميم عصري مع Tailwind CSS
- ✅ **Animations:** حركات سلسة (animate-pulse, transitions)
- ✅ **Icons:** أيقونات واضحة من lucide-react

### التفاعل
- ✅ **Real-time Badge:** عداد يتحدث مباشرة
- ✅ **Toast Notifications:** رسائل نجاح/خطأ فورية
- ✅ **Loading States:** شاشات تحميل جذابة
- ✅ **Empty State:** تصميم خاص للحالة الفارغة

---

## 📝 ملاحظات إضافية

### 1. التحديث التلقائي
يمكنك إضافة polling كل 30 ثانية في Header:

```javascript
useEffect(() => {
  if (userInfo) {
    fetchNotificationsCount();
    const interval = setInterval(fetchNotificationsCount, 30000);
    return () => clearInterval(interval);
  }
}, [userInfo]);
```

### 2. WebSocket للإشعارات الفورية
للحصول على تحديثات فورية:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://192.168.1.158:5000');

socket.on('newNotification', (notification) => {
  setUnreadCount(prev => prev + 1);
  toast.info(notification.title);
});
```

### 3. Sound Notification
إضافة صوت عند الإشعار الجديد:

```javascript
const notificationSound = new Audio('/notification.mp3');
notificationSound.play();
```

---

## ✅ Checklist التطبيق

### Backend
- [x] إنشاء Notification model في Prisma
- [x] Push schema إلى قاعدة البيانات
- [x] إنشاء notificationController.js
- [x] إنشاء notificationRoutes.js
- [x] تسجيل routes في server.js
- [x] إضافة createNotification في contactController
- [x] اختبار API endpoints

### Frontend
- [x] تحديث Header.js بأيقونة الجرس
- [x] إضافة fetchNotificationsCount
- [x] عرض عداد الإشعارات غير المقروءة
- [x] إنشاء صفحة /notifications
- [x] تطبيق جميع الـ CRUD operations
- [x] إضافة تصميم responsive
- [x] اختبار UI/UX

---

## 🔗 الروابط المهمة

- **Backend API:** `http://192.168.1.158:5000/api/notifications`
- **Frontend Page:** `http://192.168.1.158:3000/notifications`
- **Contact Admin Panel:** `http://192.168.1.158:3000/admin/messages`

---

## 📞 الدعم

في حال وجود مشاكل:
1. تحقق من تشغيل Backend و Frontend
2. تحقق من صحة JWT token
3. تحقق من console.log في المتصفح
4. تحقق من logs في terminal الـ backend

---

**تم التطبيق بنجاح! ✅**

نظام الإشعارات يعمل بكامل وظائفه:
- ✅ Backend API complete
- ✅ Frontend UI complete
- ✅ Database schema applied
- ✅ Auto-notification on message reply
- ✅ Bell icon with unread count
- ✅ Full CRUD operations

**التاريخ:** 15 يناير 2025  
**المطور:** GitHub Copilot

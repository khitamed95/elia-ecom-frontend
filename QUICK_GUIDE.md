# 🚀 دليل سريع للمطورين - Server Components

[المحتوى كما في المحاولة السابقة]

## التحويل السريع

### الطريقة القديمة → الطريقة الجديدة

**Client Component القديم:**
```javascript
'use client';
export default function Page() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api/data').then(r => r.json()).then(setData);
  }, []);
  return <div>{data?.name}</div>;
}
```

**Server Component الجديد:**
```javascript
import { fetchData } from '@/app/actions';

export default async function Page() {
  const data = await fetchData();
  return <div>{data.name}</div>;
}
```

الفرق: 
- ✅ أسرع (البيانات تُجلب مع الصفحة)
- ✅ أكثر أماناً (لا tokens مكشوفة)
- ✅ أقل JavaScript للعميل

---

## الأمان أولاً

| الطريقة | آمنة؟ |
|---------|------|
| `localStorage.getItem('token')` في Client | ❌ |
| `fetch()` مع Authorization في Client | ❌ |
| Server Action مع `cookies()` | ✅ |
| Middleware للتحقق | ✅ |

---

صنع بـ ❤️ للأمان

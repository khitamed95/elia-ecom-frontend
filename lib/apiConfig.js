/**
 * API Configuration & Utilities
 * ✅ معالجة آمنة للـ Environment Variables
 * ✅ Validation و Error Handling
 * ✅ دعم Development و Production
 */

'use client';

// ===========================
// 1️⃣ التحقق من المتغيرات
// ===========================

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ⚠️ تحذير إذا كان API_URL غير معرّف
if (!API_URL) {
  console.error('❌ خطأ: NEXT_PUBLIC_API_URL غير معرّف في البيئة');
  console.error('تأكد من ملفات .env.local أو .env.production');
}

// ✅ طباعة معلومات البيئة (في التطوير فقط)
if (NODE_ENV === 'development') {
  console.log('🌍 البيئة:', NODE_ENV);
  console.log('📡 رابط الـ API:', API_URL || 'غير معرّف ⚠️');
}

// ===========================
// 2️⃣ دالة محسّنة للـ Profile
// ===========================

/**
 * الحصول على بيانات المستخدم من الـ Profile
 * @returns {Promise<Object>} بيانات المستخدم
 * @throws {Error} إذا فشل الطلب
 */
const getProfile = async () => {
  try {
    // ✅ تحقق من وجود API_URL
    if (!API_URL) {
      throw new Error('API_URL غير معرّف - تحقق من ملفات البيئة');
    }

    // ✅ تحقق من أن الرابط بصيغة صحيحة
    const validatedURL = `${API_URL}/users/profile`;
    
    if (NODE_ENV === 'development') {
      console.log('📤 جاري الطلب:', validatedURL);
    }

    // الطلب الفعلي
    const response = await fetch(validatedURL, {
      method: 'GET',
      credentials: 'include', // يُرسل الـ Cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // ✅ معالجة الأخطاء
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP Error: ${response.status}`
      );
    }

    const data = await response.json();
    
    if (NODE_ENV === 'development') {
      console.log('✅ تم الحصول على البيانات:', data);
    }

    return data;
  } catch (error) {
    console.error('❌ خطأ في getProfile:', error.message);
    throw error; // أعد رفع الخطأ للـ caller
  }
};

// ===========================
// 3️⃣ دالة بديلة باستخدام axios
// ===========================

import axios from 'axios';

/**
 * الحصول على الـ Profile باستخدام axios
 * (استخدم هذه إذا كنت تستخدم axios في المشروع)
 */
const getProfileWithAxios = async () => {
  try {
    if (!API_URL) {
      throw new Error('API_URL غير معرّف');
    }

    const response = await axios.get(`${API_URL}/users/profile`, {
      withCredentials: true, // يُرسل الـ Cookies
      timeout: 10000, // انتظر 10 ثوان فقط
    });

    if (NODE_ENV === 'development') {
      console.log('✅ تم الحصول على البيانات:', response.data);
    }

    return response.data;
  } catch (error) {
    // معالجة أنواع الأخطاء المختلفة
    if (error.response?.status === 401) {
      console.error('❌ غير مصرح (Unauthorized) - تحقق من التوكن');
    } else if (error.response?.status === 404) {
      console.error('❌ لم يتم العثور على الـ Profile');
    } else if (error.code === 'ECONNABORTED') {
      console.error('❌ انتهت مهلة الاتصال (Timeout)');
    } else {
      console.error('❌ خطأ:', error.message);
    }
    throw error;
  }
};

// ===========================
// 4️⃣ دالة للتحقق من الاتصال
// ===========================

/**
 * تحقق من أن الـ API متاح
 * استخدمها في بداية التطبيق
 */
const checkAPIHealth = async () => {
  try {
    if (!API_URL) {
      console.warn('⚠️ API_URL غير معرّف، لا يمكن التحقق من الاتصال');
      return false;
    }

    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      timeout: 5000,
    });

    if (response.ok) {
      console.log('✅ الـ API متاح وجاهز للعمل');
      return true;
    } else {
      console.warn('⚠️ الـ API يرد بحالة غير صحيحة:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ لا يمكن الوصول للـ API:', error.message);
    return false;
  }
};

// ===========================
// 5️⃣ Export للاستخدام
// ===========================

export { 
  getProfile, 
  getProfileWithAxios, 
  checkAPIHealth,
  API_URL,
  NODE_ENV
};

// ===========================
// 6️⃣ مثال على الاستخدام
// ===========================

/*
// في أي Component:

import { getProfile } from '@/lib/apiConfig';

export default function ProfilePage() {
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        console.log('البيانات:', profile);
      } catch (error) {
        console.error('فشل جلب البيانات:', error);
      }
    };
    
    fetchProfile();
  }, []);
  
  return <div>Profile Page</div>;
}
*/

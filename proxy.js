import { NextResponse } from 'next/server';

// قائمة المسارات المحمية
const protectedRoutes = [
  '/profile',
  '/notifications',
  '/checkout',
  '/payment',
  '/orders',
  '/admin'
];

// قائمة مسارات Admin
const adminRoutes = ['/admin'];

// مسارات تسجيل الدخول
const authRoutes = ['/login', '/register', '/forgot-password'];

export default function proxy(request) {
  const pathname = request.nextUrl.pathname;
  
  // الحصول على التوكن من الـ cookies
  const token = request.cookies.get('accessToken')?.value;
  const userInfoCookie = request.cookies.get('userInfo')?.value;

  // تحليل بيانات المستخدم
  let user = null;
  if (userInfoCookie) {
    try {
      user = JSON.parse(decodeURIComponent(userInfoCookie));
    } catch (e) {
      console.error('Error parsing user info:', e);
    }
  }

  // التحقق من المسارات المحمية
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // التحقق من مسارات Admin
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (!user?.isAdmin) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // إعادة التوجيه للمستخدم المسجل من صفحات تسجيل الدخول
  if (authRoutes.some(route => pathname.startsWith(route))) {
    if (token && user) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
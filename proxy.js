import { NextResponse } from 'next/server';

export default function proxy(request) {
  // السماح بكل الطلبات - الحماية ستكون من جهة العميل
  return NextResponse.next();
}

// تحديد المسارات التي سيراقبها الحارس
export const config = {
  matcher: ['/admin/:path*', '/profile/:path*'],
};
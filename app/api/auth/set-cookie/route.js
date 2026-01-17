import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    
    // حفظ التوكن في الـ server-side cookies
    cookieStore.set('accessToken', token, {
      path: '/',
      maxAge: 2592000, // 30 days
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true // يمكن الخادم فقط من قراءة هذا الـ cookie
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting cookie:', error);
    return NextResponse.json(
      { error: 'Failed to set cookie' },
      { status: 500 }
    );
  }
}

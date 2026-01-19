'use client';

import { useSearchParams } from 'next/navigation';

/**
 * مكون Client يتعامل مع useSearchParams
 * يُستخدم داخل Suspense boundary لتجنب الأخطاء
 */
export function LoginContent({ children }) {
  const searchParams = useSearchParams();
  const redirectParam = searchParams?.get('redirect') || '';

  // تمرير المعاملات إلى الـ children كـ render prop
  return children({ redirectParam });
}


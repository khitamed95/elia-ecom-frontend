'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EditRedirectPage() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    // Redirect to the correct edit route
    router.replace(`/admin/product/edit/${id}`);
  }, [id, router]);

  return null;
}

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to auth page
    router.replace('/auth?mode=login');
  }, [router]);

  return null;
}

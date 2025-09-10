'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function VerifyClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      router.replace('/auth/error');
      return;
    }

    signIn('credentials', {
      token,
      email,
      redirect: true,
      callbackUrl: '/list',
    });
  }, [searchParams, router]);

  return <div>Verifying your account...</div>;
}

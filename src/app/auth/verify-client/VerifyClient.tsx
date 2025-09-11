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

    async function login() {
      // redirect: false prevents race conditions
      const result = await signIn('credentials', {
        token,
        email,
        redirect: false,
      });

      if (result?.ok) {
        router.replace('/list'); // redirect after successful login
      } else {
        router.replace('/auth/error'); // login failed
      }
    }

    login();
  }, [searchParams, router]);

  return <div>Verifying your account...</div>;
}

'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/signin.module.css'; // We'll create a CSS module similar to signup/reset pages

export default function SignInPage() {
  const { status } = useSession();
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/list');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    const target = e.target as typeof e.target & {
      email: { value: string };
      password: { value: string };
    };

    const email = target.email.value;
    const password = target.password.value;

    const result = await signIn('credentials', {
      redirect: false,
      callbackUrl: '/list',
      email,
      password,
    });

    if (result?.error) {
      setError('Invalid email or password');
    } else if (result?.url) {
      window.location.href = result.url;
    }
  };

  if (status === 'loading' || status === 'authenticated') return null;

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Sign In</h1>
        <p className={styles.descriptionCentered}>
          Enter your email and password to access your Pantry Pal account.
        </p>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              required
              className={styles.input}
              placeholder="you@example.com"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Password
              <span className={styles.forgotPassword}>
                <a href="/auth/forgot-password">Forgot password?</a>
              </span>
            </label>
            <input
              type="password"
              name="password"
              required
              className={styles.input}
              placeholder="Password"
            />
          </div>
          <button type="submit" className={styles.button}>
            Sign In
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
        <p className={styles.accountPromptWrapper}>
          Don&apos;t have an account?
          {' '}
          <a href="/auth/signup" className={styles.logIn}>Sign up</a>
        </p>
      </div>
    </div>
  );
}

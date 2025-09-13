'use client';

import { signOut } from 'next-auth/react';
import styles from '@/styles/signup.module.css';

const SignOut = () => (
  <div className={styles.container}>
    <div className={styles.formWrapper} style={{ maxWidth: '500px', textAlign: 'center' }}>
      <h2 className={styles.title}>Do you want to sign out?</h2>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '25px' }}>
        <button
          type="button"
          className={styles.button}
          style={{ backgroundColor: 'var(--fern-green)' }}
          onClick={() => signOut({ callbackUrl: '/', redirect: true })}
        >
          Sign Out
        </button>

        <button
          type="button"
          className={styles.button}
          style={{ backgroundColor: 'var(--sage)', color: 'var(--brunswick-green)' }}
          onClick={() => (window.location.href = '/')}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export default SignOut;

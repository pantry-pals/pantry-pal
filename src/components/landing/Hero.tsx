'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Hero() {
  const router = useRouter();

  const redirectToLogin = () => {
    router.push('/auth/signin');
  };

  const redirectToSignup = () => {
    router.push('/auth/signup');
  };

  return (
    <section className="container py-5">
      <div style={{ marginTop: '75px' }} className="row align-items-center">

        <div className="col-md-6 mb-4 mb-md-0 mt-5">
          <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
            <Image
              src="/PantryPalsLogo.png"
              alt="Pantry Pal Logo"
              width={500}
              height={500}
              priority
            />
          </div>
        </div>

        <div className="col-md-6">
          <h1 className="fw-bold">Welcome To Pantry Pals!</h1>
          <p className="text-muted">
            Lorem ipsum dolor sit amet et delectus accommodare his consul copiosae
            legendos at vix ad putent delectus delicata usu. Vidit dissentiet eos cu
            eum an brute copiosae hendrerit.
          </p>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-dark"
              onClick={redirectToLogin}
            >
              Log In
            </button>
            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={redirectToSignup}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

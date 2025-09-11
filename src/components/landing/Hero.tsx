import Image from 'next/image';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';

export default async function Hero() {
  // server-side session check
  const session = await getServerSession(authOptions);

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

          {!session && (
            <div className="d-flex gap-2">
              <Link href="/auth/signin" className="btn btn-dark">
                Log In
              </Link>
              <Link href="/auth/signup" className="btn btn-outline-dark">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

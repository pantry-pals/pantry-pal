'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Card, Col, Container, Button, Form, Row, Alert, Modal } from 'react-bootstrap';

type SignUpForm = {
  email: string;
  password: string;
  confirmPassword: string;
};

const SignUp = () => {
  const { status } = useSession();
  const router = useRouter();

  // Registration state
  const [errorMessage, setErrorMessage] = useState('');

  // Verification modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [code, setCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/list');
    }
  }, [status, router]);

  // Validation schema
  const validationSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email is invalid'),
    password: Yup.string()
      .required('Password is required')
      .min(6, 'Password must be at least 6 characters')
      .max(40, 'Password must not exceed 40 characters'),
    confirmPassword: Yup.string()
      .required('Confirm Password is required')
      .oneOf([Yup.ref('password')], 'Confirm Password does not match'),
  });

  const { register, handleSubmit, reset, formState: { errors }, getValues } = useForm<SignUpForm>({
    resolver: yupResolver(validationSchema),
  });

  // Handle registration
  const onSubmit = async (data: SignUpForm) => {
    const { email, password } = data;
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Registration failed');

      setErrorMessage('');
      setShowVerificationModal(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  // Handle code verification and auto-login
  const handleVerifyCode = async () => {
    setVerificationLoading(true);
    setVerificationError('');
    const email = getValues('email');

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Verification failed');

      // Auto sign-in after verification
      const signInResult = await signIn('credentials', {
        redirect: false,
        email,
        password: '', // empty because user verified via code
      });

      if (signInResult?.error) throw new Error(signInResult.error);

      setVerificationSuccess('Email verified! Redirecting...');
      router.push('/list');
    } catch (err: any) {
      setVerificationError(err.message || 'Something went wrong.');
    } finally {
      setVerificationLoading(false);
    }
  };

  // Handle resend code
  const handleResendCode = async () => {
    setVerificationError('');
    try {
      const email = getValues('email');
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error('Failed to resend code');
      setVerificationSuccess('New code sent to your email.');
    } catch (err: any) {
      setVerificationError(err.message || 'Failed to resend code');
    }
  };

  if (status === 'loading' || status === 'authenticated') return null;

  return (
    <main>
      <Container>
        <Row className="justify-content-center">
          <Col xs={5}>
            <h1 className="text-center">Sign Up</h1>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
            <Card>
              <Card.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                  <Form.Group className="form-group">
                    <Form.Label>Email</Form.Label>
                    <input
                      type="text"
                      {...register('email')}
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.email?.message}</div>
                  </Form.Group>

                  <Form.Group className="form-group">
                    <Form.Label>Password</Form.Label>
                    <input
                      type="password"
                      {...register('password')}
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.password?.message}</div>
                  </Form.Group>

                  <Form.Group className="form-group">
                    <Form.Label>Confirm Password</Form.Label>
                    <input
                      type="password"
                      {...register('confirmPassword')}
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.confirmPassword?.message}</div>
                  </Form.Group>

                  <Form.Group className="form-group py-3">
                    <Row>
                      <Col>
                        <Button type="submit" className="btn btn-primary">
                          Register
                        </Button>
                      </Col>
                      <Col>
                        <Button type="button" onClick={() => reset()} className="btn btn-warning float-right">
                          Reset
                        </Button>
                      </Col>
                    </Row>
                  </Form.Group>
                </Form>
              </Card.Body>
              <Card.Footer>
                Already have an account?
                {' '}
                <a href="/auth/signin">Sign in</a>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Verification Modal */}
      <Modal show={showVerificationModal} onHide={() => {}} backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Email Verification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {verificationError && <Alert variant="danger">{verificationError}</Alert>}
          {verificationSuccess && <Alert variant="success">{verificationSuccess}</Alert>}

          <Form.Group className="mb-3">
            <Form.Label>Enter 6-digit code</Form.Label>
            <Form.Control
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code"
            />
          </Form.Group>

          <div className="d-flex justify-content-between">
            <Button
              disabled={verificationLoading}
              onClick={handleVerifyCode}
              className="btn btn-primary"
            >
              Verify Code
            </Button>
            <Button variant="link" onClick={handleResendCode}>
              Resend Code
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </main>
  );
};

export default SignUp;

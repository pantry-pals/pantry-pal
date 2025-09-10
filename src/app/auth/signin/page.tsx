'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button, Card, Col, Container, Form, Row, Alert } from 'react-bootstrap';

const SignIn = () => {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

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

  return (
    <main>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={6} lg={5}>
            <h1 className="text-center mb-4">Sign In</h1>
            <Card>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Form.Group controlId="formBasicEmail" className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control name="email" type="email" required />
                  </Form.Group>
                  <Form.Group controlId="formBasicPassword" className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control name="password" type="password" required />
                  </Form.Group>
                  <Button type="submit" className="w-100">
                    Sign In
                  </Button>
                </Form>
              </Card.Body>
              <Card.Footer className="text-center">
                Don&apos;t have an account?
                {' '}
                <a href="/auth/signup">Sign up</a>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default SignIn;

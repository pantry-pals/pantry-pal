// src/lib/authOptions.ts
import { compare } from 'bcrypt';
import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  providers: [
    // Existing email/password login
    CredentialsProvider({
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'john@foo.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;

        const isPasswordValid = await compare(credentials.password, user.password);
        if (!isPasswordValid) return null;

        // **Check if email is verified**
        if (!user.emailVerified) {
          throw new Error('Email not verified. Please check your inbox.');
        }

        return { id: `${user.id}`, email: user.email, role: user.role ?? null };
      },
    }),

    // New JWT-based login (for automatic sign-in from email verification)
    CredentialsProvider({
      name: 'Email Verification Token',
      credentials: {
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials) {
        const token = credentials?.token;
        if (!token) return null;

        try {
          const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
          const user = await prisma.user.findUnique({ where: { id: payload.userId } });
          if (!user) return null;

          return { id: `${user.id}`, email: user.email, role: user.role ?? null };
        } catch (err) {
          console.error('JWT verification failed', err);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/signin', // redirect back to signin page on error
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        const role = (user as any).role ?? null;
        return { ...token, id: user.id, role };
      }
      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: { ...session.user, id: token.id, role: token.role },
    }),
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;

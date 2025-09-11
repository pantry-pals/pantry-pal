import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';

declare module 'next-auth' {
  interface User {
    role?: string | null;
  }
}

const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Email and Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        token: { label: 'Token', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        let user = null;

        // 🔑 Token-based login (email verification flow)
        if (credentials.token) {
          if (!credentials.email) return null;

          const foundUser = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!foundUser) return null;

          // Look up the token
          const tokenRecord = await prisma.emailVerificationToken.findUnique({
            where: { token: credentials.token },
          });

          if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
            return null; // invalid or expired
          }

          if (tokenRecord.used) {
            // Already used → allow login if user is verified
            if (!foundUser.emailVerified) return null;
          } else {
            // Mark token as used
            await prisma.emailVerificationToken.update({
              where: { id: tokenRecord.id },
              data: { used: true },
            });
          }

          // User must be verified by now
          if (!foundUser.emailVerified) return null;

          user = foundUser;
        } else {
          if (!credentials.email || !credentials.password) return null;

          const foundUser = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!foundUser) return null;

          const isValid = await compare(credentials.password, foundUser.password);
          if (!isValid) return null;

          if (!foundUser.emailVerified) {
            throw new Error('Email not verified');
          }

          user = foundUser;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          role: user.role ?? null,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        return { ...token, id: user.id, role: user.role ?? null };
      }
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string | null,
        },
      };
    },
    redirect({ baseUrl }) {
      return `${baseUrl}/list`;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;

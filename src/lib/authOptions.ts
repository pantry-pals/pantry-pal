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

        if (credentials.token) {
          // Token-based login after email verification
          const foundUser = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!foundUser) return null;
          if (!foundUser.emailVerified) return null;
          user = foundUser;
        } else {
          // Normal login
          if (!credentials.email || !credentials.password) return null;
          const foundUser = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (!foundUser) return null;

          const isValid = await compare(credentials.password, foundUser.password);
          if (!isValid) return null;
          if (!foundUser.emailVerified) throw new Error('Email not verified');
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
      if (user) return { ...token, id: user.id, role: user.role ?? null };
      return token;
    },
    session({ session, token }) {
      return {
        ...session,
        user: { ...session.user, id: token.id as string, role: token.role as string | null },
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

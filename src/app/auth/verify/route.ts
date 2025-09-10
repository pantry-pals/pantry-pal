import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 });

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!record) return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
  if (record.expiresAt < new Date()) return NextResponse.json({ error: 'Token expired' }, { status: 400 });

  // Mark user as verified
  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: true },
  });

  // Delete the token after use
  await prisma.emailVerificationToken.delete({ where: { id: record.id } });

  // Get absolute URL for redirect
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const redirectUrl = `${baseUrl}/auth/signin`;

  return NextResponse.redirect(redirectUrl);
}

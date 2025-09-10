import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    if (!token) throw new Error('No token');

    // Find token record and include user
    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record || record.expiresAt < new Date()) throw new Error('Invalid or expired token');

    // Mark email as verified
    await prisma.user.update({
      where: { id: record.user.id },
      data: { emailVerified: true },
    });

    // Delete the token
    await prisma.emailVerificationToken.delete({ where: { id: record.id } });

    // Redirect to frontend with token + email
    const frontendUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.redirect(
      `${frontendUrl}/auth/verify-client?token=${token}&email=${encodeURIComponent(record.user.email)}`,
    );
  } catch (err) {
    console.error('Verification error:', err);
    const frontendUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${frontendUrl}/auth/error`);
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// POST /api/produce/find-or-create
export async function POST(req: Request) {
  try {
    // Get the current session to identify the owner
    const session = await getServerSession(authOptions);
    const owner = session?.user?.email;

    if (!owner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await req.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    const trimmed = name.trim();

    // 1️⃣ Try to find an existing produce owned by this user (case-insensitive)
    const existing = await prisma.produce.findFirst({
      where: {
        name: { equals: trimmed, mode: 'insensitive' },
        owner,
      },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    // 2️⃣ Otherwise, create a new produce item linked to this user
    const created = await prisma.produce.create({
      data: {
        name: trimmed,
        owner,
        type: 'Other', // default
        location: 'Pantry', // default
        quantity: 0, // default float
        unit: 'pcs', // default unit
      },
    });

    return NextResponse.json(created);
  } catch (err: any) {
    console.error('Error in /api/produce/find-or-create:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

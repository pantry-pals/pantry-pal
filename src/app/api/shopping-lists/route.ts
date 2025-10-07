import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const owner = session.user.email;

  try {
    const body = await req.json();
    const name = body?.name?.trim();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const existing = await prisma.shoppingList.findUnique({
      where: { name_owner: { name, owner } },
      select: { id: true, name: true },
    });
    if (existing) return NextResponse.json(existing, { status: 200 });

    const created = await prisma.shoppingList.create({
      data: { name, owner },
      select: { id: true, name: true },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error creating shopping list' }, { status: 500 });
  }
}

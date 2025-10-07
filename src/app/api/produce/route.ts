// app/api/produce/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const produce = await prisma.produce.findMany({
    select: { id: true, name: true, quantity: true },
    orderBy: { name: 'asc' },
  });
  return NextResponse.json(produce);
}

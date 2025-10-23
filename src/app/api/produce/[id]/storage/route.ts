import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');

  if (!owner) {
    return NextResponse.json({ error: 'Missing owner' }, { status: 400 });
  }

  const locations = await prisma.produce.findMany({
    where: { owner },
    distinct: ['storage'],
    select: { storage: true },
  });

  const filtered = locations
    .map((l) => l.storage)
    .filter((l): l is string => !!l && l.trim().length > 0);

  return NextResponse.json(filtered);
}

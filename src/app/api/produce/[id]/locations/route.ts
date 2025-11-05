import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');

  if (!owner) {
    return NextResponse.json({ error: 'Missing owner' }, { status: 400 });
  }

  const locations = await (prisma as any).location.findMany({
    where: { owner },
    select: { name: true },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json(locations.map((l: { name: string }) => l.name));
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const owner = searchParams.get('owner');

    if (!name || !owner) {
      return NextResponse.json({ error: 'Missing name or owner' }, { status: 400 });
    }

    // Delete related records first (cascade)
    await (prisma as any).produce.deleteMany({
      where: { location: { is: { name, owner } } },
    });

    await (prisma as any).storage.deleteMany({
      where: { location: { is: { name, owner } } },
    });

    // Finally delete the location
    await (prisma as any).location.delete({
      where: {
        name_owner: {
          name,
          owner,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to delete pantry' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();

  const updated = await prisma.shoppingList.update({
    where: { id },
    data: { name: body.name },
  });

  return NextResponse.json(updated);
}

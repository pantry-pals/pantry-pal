import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const owner = session.user.email;

  try {
    const body = await req.json();

    const shoppingListId = Number(body?.shoppingListId);
    const produceId = Number(body?.produceId);
    const quantity = Number(body?.quantity);
    const price = body?.price;

    if (!shoppingListId || !produceId || !quantity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ownership check
    const [list, produce] = await Promise.all([
      prisma.shoppingList.findFirst({ where: { id: shoppingListId, owner } }),
      prisma.produce.findFirst({ where: { id: produceId, owner } }),
    ]);
    if (!list) return NextResponse.json({ error: 'List not found' }, { status: 404 });
    if (!produce) return NextResponse.json({ error: 'Produce not found' }, { status: 404 });

    const decimalPrice = price && price.length ? new Prisma.Decimal(price) : null;

    const upserted = await prisma.shoppingListItem.upsert({
      where: {
        shoppingListId_produceId: {
          shoppingListId,
          produceId,
        },
      },
      update: {
        quantity: { increment: quantity },
        ...(decimalPrice !== null ? { price: decimalPrice } : {}),
      },
      create: {
        shoppingListId,
        produceId,
        quantity,
        price: decimalPrice,
      },
      select: { id: true, shoppingListId: true, produceId: true, quantity: true, price: true },
    });

    return NextResponse.json(upserted, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error adding item' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const item = await prisma.shoppingListItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    await prisma.produce.create({
      data: {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit || '',
        type: 'Other',
        owner: 'user@example.com',
        location: { create: { name: 'Default Pantry', owner: 'user@example.com' } },
        storage: { create: { name: 'Default Shelf', location: { connect: { id: 1 } } } },
      },
    });

    await prisma.shoppingListItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shopping list item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const { restockTrigger, customThreshold } = await request.json();

    // Build the update object dynamically
    const updateData: any = {};
    if (restockTrigger) updateData.restockTrigger = restockTrigger;
    if (customThreshold !== undefined) updateData.customThreshold = parseFloat(customThreshold);

    // Update the ShoppingListItem instead of Produce
    const updatedItem = await prisma.shoppingListItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error('Error updating shopping list item restock info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

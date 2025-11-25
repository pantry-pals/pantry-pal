import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const email = session?.user?.email ?? null;

    if (!email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    let items: string[] = [];

    if (Array.isArray(body.items)) {
      items = body.items.map((i: any) => String(i).trim()).filter(Boolean);
    } else if (body.name) {
      items = [String(body.name).trim()];
    } else {
      return NextResponse.json({ error: 'No items provided' }, { status: 400 });
    }

    if (!items.length) {
      return NextResponse.json({ error: 'No valid items to add' }, { status: 400 });
    }

    // Find or create shopping list
    let shoppingList = await prisma.shoppingList.findFirst({
      where: { owner: email },
      orderBy: { createdAt: 'desc' },
    });

    if (!shoppingList) {
      shoppingList = await prisma.shoppingList.create({
        data: { name: 'My Shopping List', owner: email },
      });
    }

    // Fetch all existing item names once
    const existingItems = await prisma.shoppingListItem.findMany({
      where: { shoppingListId: shoppingList.id },
      select: { name: true },
    });

    const existingNames = new Set(existingItems.map((i) => i.name));

    // Filter out duplicates and invalid strings
    const uniqueNamesToInsert = items
      .map((n) => n.trim())
      .filter((n) => n.length > 0 && !existingNames.has(n));

    if (uniqueNamesToInsert.length === 0) {
      return NextResponse.json({ success: true, created: [] });
    }

    // Insert all at once
    await prisma.shoppingListItem.createMany({
      data: uniqueNamesToInsert.map((name) => ({
        shoppingListId: shoppingList.id,
        name,
        quantity: 1,
      })),
    });

    // Fetch newly created items to return their IDs
    const createdItems = await prisma.shoppingListItem.findMany({
      where: {
        shoppingListId: shoppingList.id,
        name: { in: uniqueNamesToInsert },
      },
      select: { id: true, name: true },
    });

    return NextResponse.json({ success: true, created: createdItems });
  } catch (error) {
    console.error('Error adding shopping list items:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

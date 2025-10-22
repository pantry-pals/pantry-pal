import { prisma } from './prisma';
import { isBelowThreshold } from './restockCheck';

export async function checkAndAddToShoppingList(owner: string) {
  const produces = await prisma.produce.findMany({
    where: { owner },
  });

  // Map each produce item to a Promise
  const promises = produces.map(async (produce) => {
    // Use the new isBelowThreshold with desiredQuantity
    const below = isBelowThreshold(
      produce.quantity,
      produce.restockTrigger,
      produce.customThreshold,
      produce.quantity, // <-- optional: or use a maxQuantity field if you have it
    );

    if (!below) return;

    // Check if produce is already in a shopping list
    const existing = await prisma.shoppingListItem.findFirst({
      where: {
        produceId: produce.id,
        shoppingList: { owner },
      },
    });
    if (existing) return;

    // Get (or create) “Default Shopping List” for this owner
    let shoppingList = await prisma.shoppingList.findFirst({ where: { owner, name: 'Default' } });
    if (!shoppingList) {
      shoppingList = await prisma.shoppingList.create({
        data: { owner, name: 'Default' },
      });
    }

    // Add item to shopping list
    await prisma.shoppingListItem.create({
      data: {
        shoppingListId: shoppingList.id,
        produceId: produce.id,
        quantity: 1, // default quantity, adjust as needed
      },
    });
  });

  await Promise.all(promises);
}

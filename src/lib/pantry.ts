import { prisma } from '@/lib/prisma';

export async function updateProduceQuantity(produceId: number, newQuantity: number, ownerEmail: string) {
  // 1. Update the produce quantity
  const produce = await prisma.produce.update({
    where: { id: produceId },
    data: { quantity: newQuantity },
  });

  // 2. Determine the restock threshold
  const user = await prisma.user.findUnique({ where: { email: ownerEmail } });
  const threshold = produce.restockThreshold ?? user?.defaultRestockThreshold ?? 1;

  let shoppingListItem = null;

  // 3. Check if quantity is below threshold
  if (produce.quantity <= threshold) {
    // 4. Find or create a shopping list
    let shoppingList = await prisma.shoppingList.findFirst({
      where: { owner: ownerEmail },
    });

    if (!shoppingList) {
      shoppingList = await prisma.shoppingList.create({
        data: { name: 'Default List', owner: ownerEmail },
      });
    }

    // 5. Calculate how much to add
    const quantityToAdd = threshold - produce.quantity > 0 ? threshold - produce.quantity : 1;

    // 6. Upsert item into shopping list
    shoppingListItem = await prisma.shoppingListItem.upsert({
      where: {
        shoppingListId_produceId: {
          shoppingListId: shoppingList.id,
          produceId: produce.id,
        },
      },
      update: {
        quantity: {
          increment: quantityToAdd,
        },
      },
      create: {
        shoppingListId: shoppingList.id,
        produceId: produce.id,
        quantity: quantityToAdd,
      },
    });
  }

  return { produce, shoppingListItem };
}

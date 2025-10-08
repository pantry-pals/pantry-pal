import { prisma } from '@/lib/prisma';

export async function updateProduceQuantity(produceId: number, newQuantity: number, ownerEmail: string) {
  // Update the produce quantity
  const produce = await prisma.produce.update({
    where: { id: produceId },
    data: { quantity: newQuantity },
  });

  // Check if auto-restock is needed
  if (produce.restockThreshold !== null && newQuantity <= produce.restockThreshold) {
    // Find or create the "Auto Restock" shopping list
    let shoppingList = await prisma.shoppingList.findFirst({
      where: { owner: ownerEmail, name: 'Auto Restock' },
    });

    if (!shoppingList) {
      shoppingList = await prisma.shoppingList.create({
        data: {
          owner: ownerEmail,
          name: 'Auto Restock',
        },
      });
    }

    // Check if the item already exists in the list
    const existingItem = await prisma.shoppingListItem.findFirst({
      where: {
        shoppingListId: shoppingList.id,
        produceId: produce.id,
      },
    });

    // Add to shopping list if it doesn't exist
    if (!existingItem) {
      await prisma.shoppingListItem.create({
        data: {
          shoppingListId: shoppingList.id,
          produceId: produce.id,
          quantity: produce.restockThreshold, // You can adjust this
        },
      });
    }
  }

  return produce;
}

import { prisma } from '../src/lib/prisma';
import { checkAndAddToShoppingList } from '../src/lib/restock';

async function testRestock() {
  const owner = 'youremail@example.com'; // Replace with your test user email

  // Ensure some produce items exist and will trigger restock
  const testProduces = [
    { name: 'Eggs', quantity: 5, restockTrigger: 'half', restockThreshold: 10, unit: 'pcs' },
    { name: 'Berries', quantity: 0, restockTrigger: 'empty', unit: 'kg' },
    { name: 'Milk', quantity: 1, restockTrigger: 'custom', customThreshold: 2, unit: 'L' },
  ];

  // Upsert test produces (create if not exists, otherwise update)
  for (const p of testProduces) {
    // eslint-disable-next-line no-await-in-loop
    await prisma.produce.upsert({
      where: { name_owner: { name: p.name, owner } },
      update: {
        quantity: p.quantity,
        restockTrigger: p.restockTrigger,
        restockThreshold: p.restockThreshold,
        customThreshold: p.customThreshold,
        unit: p.unit,
      },
      create: {
        name: p.name,
        owner,
        type: 'Test',
        location: 'Fridge',
        storage: 'Cold',
        quantity: p.quantity,
        unit: p.unit,
        restockTrigger: p.restockTrigger,
        restockThreshold: p.restockThreshold,
        customThreshold: p.customThreshold,
      },
    });
  }

  // Run restock check
  const produces = await prisma.produce.findMany({ where: { owner } });
  for (const produce of produces) {
    await checkAndAddToShoppingList(produce.id, owner);
  }

  // Print shopping list items
  const shoppingList = await prisma.shoppingList.findFirst({
    where: { owner, name: 'Auto Restock List' },
    include: { items: { include: { produce: true } } },
  });

  if (shoppingList) {
    console.log(`Shopping List: ${shoppingList.name}`);
    shoppingList.items.forEach((item: any) => {
      console.log(
        // eslint-disable-next-line max-len
        `Item: ${item.produce.name}, Quantity in Pantry: ${item.produce.quantity}, Restock Trigger: ${item.produce.restockTrigger}`,
      );
    });
  } else {
    console.log('No shopping list found for this owner.');
  }
}

testRestock()
  .then(() => console.log('Test finished'))
  .catch(console.error)
  .finally(() => prisma.$disconnect());

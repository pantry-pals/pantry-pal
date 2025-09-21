import { PrismaClient, Role, Condition } from '@prisma/client';
import { hash } from 'bcrypt';
import * as config from '../config/settings.development.json';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding the database');
  const password = await hash('changeme', 10);

  // Seed users
  for (const account of config.defaultAccounts) {
    const role = (account.role as Role) || Role.USER;
    console.log(`  Creating user: ${account.email} with role: ${role}`);

    await prisma.user.upsert({
      where: { email: account.email },
      update: {},
      create: {
        email: account.email,
        password,
        role,
        emailVerified: true,
      },
    });
  }

  // Seed stuff
  for (let index = 0; index < config.defaultData.length; index++) {
    const data = config.defaultData[index];
    const condition = (data.condition as Condition) || Condition.good;
    console.log(`  Adding stuff: ${JSON.stringify(data)}`);

    await prisma.stuff.upsert({
      where: { id: index + 1 },
      update: {},
      create: {
        name: data.name,
        quantity: data.quantity,
        owner: data.owner,
        condition,
      },
    });
  }

  // Seed products
  for (let index = 0; index < config.defaultProduce.length; index++) {
    const item = config.defaultProduce[index];
    console.log(`  Adding product: ${item.name}`);

    await prisma.product.upsert({
      where: { id: index + 1 },
      update: {},
      create: {
        name: item.name,
        type: item.type ?? null,
        price: item.price ?? null,
      },
    });
  }

// Seed produce
  for (let index = 0; index < config.defaultProduce.length; index++) {
    const produce = config.defaultProduce[index];
    console.log(`  Adding produce: ${JSON.stringify(produce)}`);

    // Find the owner user by email
    const user = await prisma.user.findUnique({
      where: { email: produce.owner },
    });

    if (!user) {
      console.warn(`  Skipping produce: user not found for ${produce.owner}`);
      continue;
    }

    // Find product by name
    const product = await prisma.product.findFirst({
      where: { name: produce.name },
    });

    if (!product) {
      console.warn(`  Skipping produce: product not found for ${produce.name}`);
      continue;
    }

    await prisma.produce.upsert({
      where: { id: index + 1 },
      update: {},
      create: {
        productId: product.id,
        userId: user.id,
        location: produce.location,
        quantity: produce.quantity,
        expiration: produce.expiration ? new Date(produce.expiration) : null,
      },
    });
  }

  // Seed shopping lists
  if (config.defaultShoppingList) {
    for (let index = 0; index < config.defaultShoppingList.length; index++) {
      const listData = config.defaultShoppingList[index];
      console.log(`  Adding shopping list: ${listData.name}`);

      // Find the owner user by email
      const user = await prisma.user.findUnique({
        where: { email: listData.owner },
      });

      if (!user) {
        console.warn(`  Skipping shopping list: user not found for ${listData.owner}`);
        continue;
      }

      // Create shopping list with items
      await prisma.shoppingList.create({
        data: {
          name: listData.name,
          userId: user.id,
          items: {
            create: listData.items.map((item, itemIndex) => ({
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              notes: item.notes,
            })),
          },
        },
      });
    }
  }

  console.log('Seeding complete!');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

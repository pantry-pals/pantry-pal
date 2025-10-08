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

  // Seed produce
  for (let index = 0; index < config.defaultProduce.length; index++) {
    const produce = config.defaultProduce[index];
    console.log(`  Adding produce: ${JSON.stringify(produce)}`);

    await prisma.produce.upsert({
      where: { name_owner: { name: produce.name, owner: produce.owner } },
      update: {},
      create: {
        name: produce.name,
        type: produce.type,
        location: produce.location,
        quantity: produce.quantity,
        unit: produce.unit,
        expiration: new Date(produce.expiration),
        owner: produce.owner,
      },
    });
  }

  // Seed shopping lists
  for (const shoppinglist of config.defaultShoppingList) {
    console.log(`  Adding shopping list: ${JSON.stringify(shoppinglist)}`);

    const createdList = await prisma.shoppingList.upsert({
      where: { name_owner: { name: shoppinglist.name, owner: shoppinglist.owner } },
      update: {},
      create: {
        name: shoppinglist.name,
        owner: shoppinglist.owner,
      },
    });

    for (const item of shoppinglist.items) {
      const produce = await prisma.produce.findFirst({
        where: { name: item.produceName },
      });

      if (!produce) {
        console.warn(`Produce "${item.produceName}" not found, skipping item.`);
        continue;
      }

      await prisma.shoppingListItem.upsert({
        where: {
          shoppingListId_produceId: {
            shoppingListId: createdList.id,
            produceId: produce.id,
          },
        },
        update: {},
        create: {
          shoppingListId: createdList.id,
          produceId: produce.id,
          quantity: item.quantity,
          price: item.price,
        },
      });
    }
  }

  // Seed Recipe
  if ((config as any).defaultRecipes?.length) {
    for (const r of (config as any).defaultRecipes as Array<{
      title: string;
      cuisine: string;
      description?: string;
      imageUrl?: string;
      dietary?: string[];
      ingredients?: string[];
      owner: string;
    }>) {
      console.log(`  upsert recipe: ${r.title} (${r.owner})`);
      await prisma.recipe.upsert({
        where: { title_owner: { title: r.title, owner: r.owner } },
        update: {
          cuisine: r.cuisine,
          description: r.description ?? null,
          imageUrl: r.imageUrl && r.imageUrl.length > 0 ? r.imageUrl : null,
          dietary: r.dietary ?? [],
          ingredients: r.ingredients ?? [],
        },
        create: {
          title: r.title,
          cuisine: r.cuisine,
          description: r.description ?? null,
          imageUrl: r.imageUrl && r.imageUrl.length > 0 ? r.imageUrl : null,
          dietary: r.dietary ?? [],
          ingredients: r.ingredients ?? [],
          owner: r.owner,
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
  
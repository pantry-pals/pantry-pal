/* eslint-disable no-await-in-loop */
import { PrismaClient, Role } from '@prisma/client';
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

  // Seed produce
  for (const produce of config.defaultProduce) {
    console.log(`  Adding produce: ${JSON.stringify(produce)}`);

    // Upsert the Location (unique per owner)
    const location = await prisma.location.upsert({
      where: {
        name_owner: {
          name: produce.location,
          owner: produce.owner,
        },
      },
      update: {},
      create: {
        name: produce.location,
        owner: produce.owner,
      },
    });

    // Upsert the Storage (unique per location)
    const storage = await prisma.storage.upsert({
      where: {
        name_locationId: {
          name: produce.storage,
          locationId: location.id,
        },
      },
      update: {},
      create: {
        name: produce.storage,
        locationId: location.id,
      },
    });

    // Upsert the Produce (link via IDs)
    await prisma.produce.upsert({
      where: { name_owner: { name: produce.name, owner: produce.owner } },
      update: {},
      create: {
        name: produce.name,
        type: produce.type,
        locationId: location.id,
        storageId: storage.id,
        quantity: produce.quantity,
        unit: produce.unit,
        expiration: produce.expiration ? new Date(produce.expiration) : null,
        owner: produce.owner,
        image: produce.image ?? null,
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
      await prisma.shoppingListItem.upsert({
        where: {
          shoppingListId_name: {
            shoppingListId: createdList.id,
            name: item.name,
          },
        },
        update: {},
        create: {
          shoppingListId: createdList.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
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

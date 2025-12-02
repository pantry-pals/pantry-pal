/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
/* eslint-disable import/no-extraneous-dependencies */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
  log: ['query'],
});

async function main() {
  console.log('Backfilling RecipeIngredient from Recipe.ingredients...');

  const recipes = await prisma.recipe.findMany();

  for (const recipe of recipes) {
    if (!recipe.ingredients || recipe.ingredients.length === 0) continue;

    console.log(`  Recipe ${recipe.id} (${recipe.title}) -> ${recipe.ingredients.length} ingredients`);

    // Optional: clear any existing items so it’s idempotent
    await prisma.recipeIngredient.deleteMany({
      where: { recipeId: recipe.id },
    });

    for (let index = 0; index < recipe.ingredients.length; index += 1) {
      const name = recipe.ingredients[index];

      await prisma.recipeIngredient.create({
        data: {
          recipeId: recipe.id,
          name,
          quantity: null,
          unit: null,
          order: index,
        },
      });
    }
  }

  console.log('Done backfilling.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

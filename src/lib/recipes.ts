'use server';

import { prisma } from '@/lib/prisma';

export async function getRecipes() {
  return prisma.recipe.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

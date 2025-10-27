'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';

export async function getRecipes() {
  return prisma.recipe.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function getRecipeById(id: number) {
  if (!Number.isFinite(id)) return null;
  return prisma.recipe.findUnique({
    where: { id },
  });
}

type CreateInput = {
  title: string;
  cuisine: string;
  description?: string;
  imageUrl?: string;
  dietary?: string[];
  ingredients?: string[];
};

export async function createRecipe(input: CreateInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error('Unauthorized');

  const u = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { role: true },
  });
  if (u?.role !== 'ADMIN') throw new Error('Forbidden');

  const data = {
    title: input.title.trim(),
    cuisine: input.cuisine.trim(),
    description: input.description?.trim() || null,
    imageUrl: input.imageUrl?.trim() || null,
    dietary: (input.dietary ?? []).map((s) => s.trim()).filter(Boolean),
    ingredients: (input.ingredients ?? []).map((s) => s.trim()).filter(Boolean),
    owner: session.user.email,
  };
  if (!data.title) throw new Error('Title required');
  if (!data.cuisine) throw new Error('Cuisine required');

  return prisma.recipe.create({ data });
}

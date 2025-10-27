'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// Minimal shape so TS knows about session.user.email
type SessionLike = {
  user?: { email?: string | null } | null;
} | null;

/** Fetch all recipes (latest first). */
export async function getRecipes() {
  return prisma.recipe.findMany({ orderBy: { createdAt: 'desc' } });
}

/** Fetch a single recipe by numeric ID. */
export async function getRecipeById(id: number) {
  if (!Number.isFinite(id)) return null;
  return prisma.recipe.findUnique({ where: { id } });
}

/** Type for creating new recipes. */
type CreateInput = {
  title: string;
  cuisine: string;
  description?: string;
  imageUrl?: string;
  dietary?: string[];
  ingredients?: string[];
  instructions?: string;
  servings?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  sourceUrl?: string;
};

/** Create a new recipe (any logged-in user can create). */
export async function createRecipe(input: CreateInput) {
  const session = (await getServerSession()) as SessionLike;
  const email = session?.user?.email ?? null;
  if (!email) throw new Error('Unauthorized');

  const data = {
    title: input.title.trim(),
    cuisine: input.cuisine.trim(),
    description: input.description?.trim() || null,
    imageUrl: input.imageUrl?.trim() || null,
    dietary: (input.dietary ?? []).map((s) => s.trim()).filter(Boolean),
    ingredients: (input.ingredients ?? []).map((s) => s.trim()).filter(Boolean),
    owner: email,
    instructions: input.instructions?.trim() || null,
    servings: input.servings ?? null,
    prepMinutes: input.prepMinutes ?? null,
    cookMinutes: input.cookMinutes ?? null,
    sourceUrl: input.sourceUrl?.trim() || null,
  };

  if (!data.title) throw new Error('Title required');
  if (!data.cuisine) throw new Error('Cuisine required');

  return prisma.recipe.create({ data });
}

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

/** Type for creating/updating recipes. */
type RecipeInput = {
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

/** Normalize/clean recipe data for create/update. */
function normalizeRecipeInput(input: RecipeInput, ownerEmail?: string | null) {
  const data = {
    title: input.title.trim(),
    cuisine: input.cuisine.trim(),
    description: input.description?.trim() || null,
    imageUrl: input.imageUrl?.trim() || null,
    dietary: (input.dietary ?? []).map((s) => s.trim()).filter(Boolean),
    ingredients: (input.ingredients ?? []).map((s) => s.trim()).filter(Boolean),
    instructions: input.instructions?.trim() || null,
    servings: input.servings ?? null,
    prepMinutes: input.prepMinutes ?? null,
    cookMinutes: input.cookMinutes ?? null,
    sourceUrl: input.sourceUrl?.trim() || null,
    // owner is only set on create; for update we leave it alone
    ...(ownerEmail ? { owner: ownerEmail } : {}),
  };

  if (!data.title) throw new Error('Title required');
  if (!data.cuisine) throw new Error('Cuisine required');

  return data;
}

/** Create a new recipe (any logged-in user can create). */
export async function createRecipe(input: RecipeInput) {
  const session = (await getServerSession()) as SessionLike;
  const email = session?.user?.email ?? null;
  if (!email) throw new Error('Unauthorized');

  const data = normalizeRecipeInput(input, email);

  return prisma.recipe.create({ data });
}

/** Update an existing recipe (owner or admin@foo.com only). */
export async function updateRecipe(id: number, input: RecipeInput) {
  const session = (await getServerSession()) as SessionLike;
  const email = session?.user?.email ?? null;
  if (!email) throw new Error('Unauthorized');

  if (!Number.isFinite(id)) throw new Error('Invalid recipe id');

  const existing = await prisma.recipe.findUnique({
    where: { id },
    select: { owner: true },
  });

  if (!existing) throw new Error('Recipe not found');

  const ownerField = existing.owner as string | string[] | null;

  let owners: string[] = [];
  if (Array.isArray(ownerField)) {
    owners = ownerField;
  } else if (typeof ownerField === 'string') {
    owners = [ownerField];
  }

  const isAdmin = email === 'admin@foo.com';
  const isOwner = owners.includes(email);

  if (!isAdmin && !isOwner) {
    throw new Error('Not authorized to edit this recipe');
  }

  const data = normalizeRecipeInput(input);

  return prisma.recipe.update({
    where: { id },
    data,
  });
}

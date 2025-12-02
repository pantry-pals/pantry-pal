'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

// Minimal shape so TS knows about session.user.email
type SessionLike = {
  user?: { email?: string | null } | null;
} | null;

type IngredientItemInput = {
  name: string;
  quantity?: number | null;
  unit?: string | null;
};

/** Type for creating/updating recipes. */
type RecipeInput = {
  title: string;
  cuisine: string;
  description?: string;
  imageUrl?: string;
  dietary?: string[];
  // legacy – optional, still accepted
  ingredients?: string[];
  // new structured ingredients
  ingredientItems?: IngredientItemInput[];
  instructions?: string;
  servings?: number;
  prepMinutes?: number;
  cookMinutes?: number;
  sourceUrl?: string;
};

type NormalizeMode = 'create' | 'update';

/**
 * Normalize ingredient data:
 * - CREATE: ingredientItems → ingredients; fall back to legacy ingredients[]
 * - UPDATE: use ingredientItems ONLY; do NOT fall back to ingredients[]
 *   (so we don't nuke quantities/units accidentally)
 */
function normalizeIngredientItems(
  input: RecipeInput,
  mode: NormalizeMode,
): { items: IngredientItemInput[]; names: string[] } {
  let rawItems: IngredientItemInput[] = [];

  if (input.ingredientItems && input.ingredientItems.length > 0) {
    rawItems = input.ingredientItems;
  } else if (mode === 'create' && input.ingredients && input.ingredients.length > 0) {
    // On create, we allow legacy ingredients[] as the source
    rawItems = input.ingredients.map((name) => ({
      name,
      quantity: null,
      unit: null,
    }));
  } else {
    // On update with no ingredientItems provided → leave existing DB rows as-is
    rawItems = [];
  }

  const items = rawItems
    .map((item) => ({
      name: item.name.trim(),
      quantity:
        typeof item.quantity === 'number' ? item.quantity : null,
      unit: item.unit?.trim() || null,
    }))
    .filter((item) => item.name.length > 0);

  const names = items.map((i) => i.name);
  return { items, names };
}

/** Normalize/clean recipe data for create/update. */
function normalizeRecipeInput(
  input: RecipeInput,
  mode: NormalizeMode,
  ownerEmail?: string | null,
) {
  const { items, names } = normalizeIngredientItems(input, mode);

  const recipeData = {
    title: input.title.trim(),
    cuisine: input.cuisine.trim(),
    description: input.description?.trim() || null,
    imageUrl: input.imageUrl?.trim() || null,
    dietary: (input.dietary ?? [])
      .map((s) => s.trim())
      .filter(Boolean),
    // legacy field kept in sync with structured items
    ingredients: names,
    instructions: input.instructions?.trim() || null,
    servings: input.servings ?? null,
    prepMinutes: input.prepMinutes ?? null,
    cookMinutes: input.cookMinutes ?? null,
    sourceUrl: input.sourceUrl?.trim() || null,
    ...(ownerEmail ? { owner: ownerEmail } : {}),
  };

  if (!recipeData.title) throw new Error('Title required');
  if (!recipeData.cuisine) throw new Error('Cuisine required');

  return { recipeData, ingredientItems: items };
}

/** Fetch all recipes (latest first). */
export async function getRecipes() {
  return prisma.recipe.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      ingredientItems: {
        orderBy: { order: 'asc' },
      },
    },
  });
}

/** Fetch a single recipe by numeric ID. */
export async function getRecipeById(id: number) {
  if (!Number.isFinite(id)) return null;
  return prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredientItems: {
        orderBy: { order: 'asc' },
      },
    },
  });
}

/** Create a new recipe (any logged-in user can create). */
export async function createRecipe(input: RecipeInput) {
  const session = (await getServerSession()) as SessionLike;
  const email = session?.user?.email ?? null;
  if (!email) throw new Error('Unauthorized');

  const { recipeData, ingredientItems } = normalizeRecipeInput(
    input,
    'create',
    email,
  );

  return prisma.recipe.create({
    data: {
      ...recipeData,
      ingredientItems:
        ingredientItems.length > 0
          ? {
            create: ingredientItems.map((item, index) => ({
              name: item.name,
              quantity: item.quantity ?? null,
              unit: item.unit ?? null,
              order: index,
            })),
          }
          : undefined,
    },
  });
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

  const { recipeData, ingredientItems } = normalizeRecipeInput(
    input,
    'update',
  );

  return prisma.recipe.update({
    where: { id },
    data: {
      ...recipeData,
      // Only rewrite ingredientItems when we actually got some in input.
      // This is where you can update quantities/units by sending new items.
      ...(ingredientItems.length > 0
        ? {
          ingredientItems: {
            deleteMany: {}, // delete all existing rows for this recipe
            create: ingredientItems.map((item, index) => ({
              name: item.name,
              quantity: item.quantity ?? null,
              unit: item.unit ?? null,
              order: index,
            })),
          },
        }
        : {}),
    },
  });
}

import { Container } from 'react-bootstrap';
import RecipesClient from '@/components/recipes/RecipesClient';
import { getRecipes } from '@/lib/recipes';

import { getServerSession } from 'next-auth';
import type { NextAuthOptions, Session } from 'next-auth'; // ⬅️ add types
import authOptions from '@/lib/authOptions';

import { prisma } from '@/lib/prisma';
import { getUserProduceByEmail } from '@/lib/dbActions';

export const dynamic = 'force-dynamic';

export default async function RecipeListPage() {
  // @ts-ignore
  const session = (await getServerSession(authOptions as NextAuthOptions)) as Session | null;

  let isAdmin = false;
  let pantry: any[] = [];

  const email = session?.user?.email ?? null;
  if (email) {
    const u = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });
    isAdmin = u?.role === 'ADMIN';
    pantry = await getUserProduceByEmail(email);
  }

  const recipes = await getRecipes();

  return (
    <main>
      <Container id="list" fluid className="py-3">
        <Container>
          <h2 className="text-center mb-4">Recipes</h2>
          <RecipesClient recipes={recipes} produce={pantry} isAdmin={isAdmin} />
        </Container>
      </Container>
    </main>
  );
}

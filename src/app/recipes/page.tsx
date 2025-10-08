import { Container } from 'react-bootstrap';
import RecipesClient from '@/components/RecipesClient';
import { getRecipes } from '@/lib/recipes';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { getUserProduceByEmail } from '@/lib/dbActions';

export const dynamic = 'force-dynamic';

export default async function RecipeListPage() {
  const session = await getServerSession(authOptions);

  let isAdmin = false;
  let pantry: any[] = [];

  if (session?.user?.email) {
    const u = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    isAdmin = u?.role === 'ADMIN';
    pantry = await getUserProduceByEmail(session.user.email);
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

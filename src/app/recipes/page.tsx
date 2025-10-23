import { Container, Button } from 'react-bootstrap';
import RecipesClient from '@/components/RecipesClient';
import { getRecipes } from '@/lib/recipes';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { getUserProduceByEmail } from '@/lib/dbActions';
import Link from 'next/link';

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
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="m-0">Recipes</h2>
            <Link href="/recipe/new" passHref>
              <Button variant="primary">+ Add Recipe</Button>
            </Link>
          </div>

          <RecipesClient recipes={recipes} produce={pantry} isAdmin={isAdmin} />
        </Container>
      </Container>
    </main>
  );
}

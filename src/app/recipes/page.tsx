import { Container } from 'react-bootstrap';
import RecipesClient from '@/components/recipes/RecipesClient';
import { getRecipes } from '@/lib/recipes';

import { getServerSession } from 'next-auth';
import { getUserProduceByEmail } from '@/lib/dbActions';

export const dynamic = 'force-dynamic';

// ...
export default async function RecipeListPage() {
  const session = await getServerSession();

  const email = session?.user?.email ?? null;
  const canAdd = !!email; // anyone logged-in can add
  let pantry: any[] = [];
  if (email) pantry = await getUserProduceByEmail(email);

  const recipes = await getRecipes();

  return (
    <main>
      <Container id="list" fluid className="py-3">
        <Container>
          <h2 className="text-center mb-4">Recipes</h2>
          <RecipesClient recipes={recipes} produce={pantry} canAdd={canAdd} />
        </Container>
      </Container>
    </main>
  );
}

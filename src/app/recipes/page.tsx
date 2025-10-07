import { Col, Container, Row } from 'react-bootstrap';
import RecipeCard from '@/components/RecipeCard';
import AddRecipeCard from '@/components/AddRecipeCard';
import { getRecipes } from '@/lib/recipes';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function RecipeListPage() {
  const [recipes, session] = await Promise.all([
    getRecipes(),
    getServerSession(authOptions),
  ]);

  let isAdmin = false;
  if (session?.user?.email) {
    const u = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });
    isAdmin = u?.role === 'ADMIN';
  }

  return (
    <main>
      <Container id="list" fluid className="py-3">
        <Container>
          <Row>
            <Col>
              <h2 className="text-center">Recipes</h2>

              <Row xs={1} md={2} lg={3} className="g-4 mt-4">
                {recipes.map((r) => (
                  <Col key={r.id}>
                    <RecipeCard
                      id={r.id}
                      title={r.title}
                      description={r.description}
                      imageUrl={r.imageUrl ?? undefined}
                      cuisine={r.cuisine}
                      dietary={r.dietary ?? []}
                      ingredients={r.ingredients ?? []}
                    />
                  </Col>
                ))}

                {/* Add Recipe Card (admin only) */}
                {isAdmin && (
                  <Col>
                    <AddRecipeCard />
                  </Col>
                )}
              </Row>
            </Col>
          </Row>
        </Container>
      </Container>
    </main>
  );
}

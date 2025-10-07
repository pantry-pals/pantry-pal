import { Col, Container, Row, Button } from 'react-bootstrap';
import RecipeCard from '@/components/RecipeCard';
import { getRecipes } from '@/lib/recipes';

export const dynamic = 'force-dynamic';

export default async function RecipeListPage() {
  const recipes = await getRecipes();

  return (
    <main>
      <Container id="list" fluid className="py-3">
        <Container>
          <Row>
            <Col>
              <h2 className="text-center">Recipes</h2>

              <Row className="mt-4">
                <Col className="text-center">
                  <Button href="/recipes/add" className="btn-dark" type="button">
                    Add Recipe
                  </Button>
                </Col>
              </Row>

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
              </Row>
            </Col>
          </Row>
        </Container>
      </Container>
    </main>
  );
}

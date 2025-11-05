import Link from 'next/link';
import { Container, Row, Col, Image, Badge, Button } from 'react-bootstrap';
import { notFound } from 'next/navigation';
import { getRecipeById } from '@/lib/recipes';

type PageProps = { params: { id: string } };
export const dynamic = 'force-dynamic';

export default async function RecipeDetailPage({ params }: PageProps) {
  const id = Number(params.id);
  if (Number.isNaN(id)) return notFound();

  const recipe = await getRecipeById(id);
  if (!recipe) return notFound();

  return (
    <main>
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="m-0">{recipe.title}</h2>
          <Link href="/recipes" passHref>
            <Button variant="outline-dark">← Back to Recipes</Button>
          </Link>
        </div>

        {recipe.cuisine && <div className="text-muted mb-2">{recipe.cuisine}</div>}

        {recipe.dietary?.length ? (
          <div className="d-flex flex-wrap gap-2 mb-3">
            {recipe.dietary.map((d) => (
              <Badge bg="secondary" key={d}>{d}</Badge>
            ))}
          </div>
        ) : null}

        <Row className="align-items-start g-4">
          <Col lg={6} className="order-2 order-lg-1">
            {recipe.description && <p className="mb-4">{recipe.description}</p>}

            <section className="mb-4">
              <h5 className="mb-2">Ingredients</h5>
              <ul>
                {(recipe.ingredients ?? []).map((ing) => (
                  <li key={ing}>{ing}</li>
                ))}
              </ul>
            </section>

            {recipe.instructions?.trim() && (
              <section className="mb-4">
                <h5 className="mb-2">Instructions</h5>
                {/* preserve newlines from the DB */}
                <p style={{ whiteSpace: 'pre-line' }}>{recipe.instructions}</p>
              </section>
            )}

            {(recipe.servings || recipe.prepMinutes || recipe.cookMinutes) && (
              <section className="mb-4 text-muted">
                {recipe.servings ? (
                  <div>
                    Servings:
                    {recipe.servings}
                  </div>
                ) : null}
                {recipe.prepMinutes ? (
                  <div>
                    Prep time:
                    {recipe.prepMinutes}
                    {' '}
                    min
                  </div>
                ) : null}
                {recipe.cookMinutes ? (
                  <div>
                    Cook time:
                    {recipe.cookMinutes}
                    {' '}
                    min
                  </div>
                ) : null}
              </section>
            )}

            {recipe.sourceUrl && (
              <Button
                as="a"
                href={recipe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="success"
              >
                View Original Recipe
              </Button>
            )}
          </Col>

          <Col lg={6} className="order-1 order-lg-2">
            <div style={{ position: 'relative', width: '100%', height: 320 }}>
              <Image
                src={recipe.imageUrl || 'https://placehold.co/800x320?text=Recipe'}
                alt={recipe.title}
                fluid
                style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: 8 }}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </main>
  );
}

'use client';

import { Col, Container, Row, Button, Card, Image } from 'react-bootstrap';

// Fake recipes for mockup
const recipes = [
  {
    title: 'Spaghetti Bolognese',
    description: 'A hearty Italian pasta with rich tomato sauce.',
    imageUrl: 'https://placehold.co/400x200?text=Spaghetti',
    cuisine: 'Italian',
    dietary: ['Gluten'],
  },
  {
    title: 'Chicken Curry',
    description: 'A flavorful and spicy Indian curry.',
    imageUrl: 'https://placehold.co/400x200?text=Curry',
    cuisine: 'Indian',
    dietary: ['Dairy-Free'],
  },
  {
    title: 'Avocado Toast',
    description: 'Simple, fresh, and healthy breakfast option.',
    imageUrl: 'https://placehold.co/400x200?text=Avocado+Toast',
    cuisine: 'American',
    dietary: ['Vegan'],
  },
];

export default function RecipeListPage() {
  return (
    <main>
      <Container id="list" fluid className="py-3">
        <Container>
          <Row>
            <Col>
              <h2 className="text-center">Recipes</h2>
              {/* Add Recipe button */}
              <Row className="mt-4">
                <Col className="text-center">
                  <Button href="/add" className="btn-dark" type="button">
                    Add Recipe
                  </Button>
                </Col>
              </Row>

              {/* Recipe cards */}
              <Row xs={1} md={2} lg={3} className="g-4 mt-4">
                {recipes.map((recipe) => (
                  <Col key={recipe.title}>
                    <Card className="h-100 shadow-sm">
                      <div style={{ position: 'relative', height: '200px', width: '100%' }}>
                        <Image
                          src={recipe.imageUrl}
                          alt={recipe.title}
                          fluid
                          style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                        />
                      </div>
                      <Card.Body>
                        <Card.Title>{recipe.title}</Card.Title>
                        <Card.Text>{recipe.description}</Card.Text>
                        <div className="mb-3">
                          <small className="text-muted">{recipe.cuisine}</small>
                          <br />
                          <small className="text-muted">
                            {Array.isArray(recipe.dietary) ? recipe.dietary.join(', ') : recipe.dietary}
                          </small>
                        </div>
                        <Button href="/recipes" className="btn-dark" type="button">
                          View Recipe
                        </Button>
                      </Card.Body>
                    </Card>
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

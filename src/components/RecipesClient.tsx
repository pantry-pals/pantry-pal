'use client';

import { useState, useMemo } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import RecipeCard from './RecipeCard';
import AddRecipeCard from './AddRecipeCard';

type Props = {
  recipes: any[];
  produce: { name: string }[];
  isAdmin: boolean;
};

export default function RecipesClient({ recipes, produce, isAdmin }: Props) {
  const [showCanMake, setShowCanMake] = useState(false);

  const pantryNames = useMemo(
    () => new Set(produce.map((p) => p.name.toLowerCase())),
    [produce],
  );

  const filteredRecipes = useMemo(() => {
    if (!showCanMake) return recipes;
    return recipes.filter((r) => r.ingredients.every((ing: string) => pantryNames.has(ing.toLowerCase())));
  }, [recipes, showCanMake, pantryNames]);

  return (
    <>
      <div className="text-center mb-4">
        <Button
          variant={showCanMake ? 'success' : 'outline-dark'}
          onClick={() => setShowCanMake((v) => !v)}
        >
          {showCanMake ? 'Show All Recipes' : 'Show Recipes I Can Make'}
        </Button>
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredRecipes.map((r) => (
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

        {isAdmin && (
          <Col>
            <AddRecipeCard />
          </Col>
        )}
      </Row>
    </>
  );
}

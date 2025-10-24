'use client';

import { useState, useMemo } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import RecipeCard from './RecipeCard';
import AddRecipeModal from '@/components/AddRecipeModal';

type Props = {
  recipes: any[];
  produce: { name: string }[];
  isAdmin: boolean;
};

export default function RecipesClient({ recipes, produce, isAdmin }: Props) {
  const [showCanMake, setShowCanMake] = useState(false);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const pantryNames = useMemo(
    () => new Set(produce.map((p) => p.name.toLowerCase())),
    [produce],
  );

  // Filter by what user can make
  const canMakeFiltered = useMemo(() => {
    if (!showCanMake) return recipes;
    return recipes.filter((r) =>
      r.ingredients.every((ing: string) => pantryNames.has(ing.toLowerCase())),
    );
  }, [recipes, showCanMake, pantryNames]);

  // Then filter by search query
  const filteredRecipes = useMemo(() => {
    const query = search.toLowerCase();
    if (!query) return canMakeFiltered;
    return canMakeFiltered.filter(
      (r) =>
        r.title.toLowerCase().includes(query) ||
        r.cuisine.toLowerCase().includes(query) ||
        r.ingredients.some((ing: string) => ing.toLowerCase().includes(query)) ||
        (r.dietary ?? []).some((tag: string) => tag.toLowerCase().includes(query)),
    );
  }, [canMakeFiltered, search]);

  return (
    <>
      {/* Header bar: left toggle, centered search, right add button */}
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        {/* Left: toggle */}
        <div>
          <Button
            variant={showCanMake ? 'success' : 'outline-dark'}
            onClick={() => setShowCanMake((v) => !v)}
          >
            {showCanMake ? 'Show All Recipes' : 'Show Recipes I Can Make'}
          </Button>
        </div>

        {/* Center: search */}
        <div className="flex-grow-1 d-flex justify-content-center">
          <Form style={{ width: '100%', maxWidth: 400 }}>
            <Form.Control
              type="text"
              placeholder="Search recipes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Form>
        </div>

        {/* Right: Add Recipe opens modal (no link) */}
        {isAdmin && (
          <div>
            <Button className="btn-add" onClick={() => setShowAdd(true)}>
              + Add Recipe
            </Button>
          </div>
        )}
      </div>

      <Row xs={1} md={2} lg={3} className="g-4">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((r) => (
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
          ))
        ) : (
          <p className="text-center text-muted w-100">No recipes found.</p>
        )}
      </Row>

      {/* Modal */}
      {isAdmin && (
        <AddRecipeModal show={showAdd} onHide={() => setShowAdd(false)} />
      )}
    </>
  );
}

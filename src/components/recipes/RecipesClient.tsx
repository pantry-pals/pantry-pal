'use client';

import { useState, useMemo, useCallback } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import AddRecipeModal from '@/components/recipes/AddRecipeModal';
import RecipeCard from './RecipeCard';
import '../../styles/buttons.css';

type Props = {
  recipes: any[];
  produce: { name: string }[];
  canAdd: boolean;
  currentUserEmail: string | null;
  isAdmin: boolean;
};

export default function RecipesClient({
  recipes,
  produce,
  canAdd,
  currentUserEmail,
  isAdmin,
}: Props) {
  const [showCanMake, setShowCanMake] = useState(false);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const pantryNames = useMemo(
    () => new Set(produce.map((p) => p.name.toLowerCase())),
    [produce],
  );

  const canMakeFiltered = useMemo(() => {
    if (!showCanMake) return recipes;
    return recipes.filter((r) => r.ingredients.every((ing: string) => pantryNames.has(ing.toLowerCase())));
  }, [recipes, showCanMake, pantryNames]);

  const filteredRecipes = useMemo(() => {
    const query = search.toLowerCase();
    if (!query) return canMakeFiltered;
    return canMakeFiltered.filter(
      (r) => r.title.toLowerCase().includes(query)
        || r.cuisine.toLowerCase().includes(query)
        || r.ingredients.some((ing: string) => ing.toLowerCase().includes(query))
        || (r.dietary ?? []).some((tag: string) => tag.toLowerCase().includes(query)),
    );
  }, [canMakeFiltered, search]);

  // Helper: can current user edit this recipe?
  const canEditRecipe = useCallback(
    (ownerRaw: string | string[] | undefined): boolean => {
      if (!currentUserEmail) return false;
      if (isAdmin) return true;

      const owner = ownerRaw ?? 'Pantry Pals Team';

      if (Array.isArray(owner)) {
        return owner.includes(currentUserEmail);
      }
      return owner === currentUserEmail;
    },
    [currentUserEmail, isAdmin],
  );

  // When editMode is ON, only show recipes the user can edit
  const recipesToShow = useMemo(() => {
    if (!editMode) return filteredRecipes;
    return filteredRecipes.filter((r) => canEditRecipe(r.owner));
  }, [filteredRecipes, editMode, canEditRecipe]);

  return (
    <>
      {/* Top controls row */}
      <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <Button
            variant={showCanMake ? 'success' : 'outline-dark'}
            onClick={() => setShowCanMake((v) => !v)}
          >
            {showCanMake ? 'Show All Recipes' : 'Show Recipes I Can Make'}
          </Button>
        </div>

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

        <div className="d-flex gap-2">
          {canAdd && (
            <Button className="btn-add" onClick={() => setShowAdd(true)}>
              + Add Recipe
            </Button>
          )}

          {canAdd && (
            <Button
              variant={editMode ? 'danger' : 'outline-secondary'}
              size="sm"
              onClick={() => setEditMode((v) => !v)}
            >
              {editMode ? 'Cancel' : 'Edit Recipes'}
            </Button>
          )}
        </div>
      </div>

      {/* Recipe cards */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {recipesToShow.length > 0 ? (
          recipesToShow.map((r) => {
            const owner = r.owner ?? 'Pantry Pals Team';
            const canEdit = canEditRecipe(owner);

            return (
              <Col key={r.id}>
                <RecipeCard
                  id={r.id}
                  title={r.title}
                  description={r.description}
                  imageUrl={r.imageUrl ?? undefined}
                  cuisine={r.cuisine}
                  dietary={r.dietary ?? []}
                  ingredients={r.ingredients ?? []}
                  owner={owner}
                  canEdit={canEdit}
                  editMode={editMode}
                  instructions={r.instructions ?? null}
                  servings={r.servings ?? null}
                  prepMinutes={r.prepMinutes ?? null}
                  cookMinutes={r.cookMinutes ?? null}
                  sourceUrl={r.sourceUrl ?? null}
                  pantryNames={pantryNames}
                />
              </Col>
            );
          })
        ) : (
          <p className="text-center text-muted w-100">No recipes found.</p>
        )}
      </Row>

      {canAdd && (
        <AddRecipeModal show={showAdd} onHide={() => setShowAdd(false)} />
      )}
    </>
  );
}

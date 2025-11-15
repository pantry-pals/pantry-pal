'use client';

import { useState, useMemo, useEffect } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import AddRecipeModal from '@/components/recipes/AddRecipeModal';
import RecipeCard from './RecipeCard';
import '../../styles/buttons.css'; // adjust path if styles folder is elsewhere

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
  const [deleteMode, setDeleteMode] = useState(false);

  //
  // FIX: Reset delete mode when user changes
  //
  useEffect(() => {
    setDeleteMode(false);
  }, [currentUserEmail, isAdmin]);
  //

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

  // When deleteMode is on, show only recipes the current user can delete
  const recipesToShow = useMemo(() => {
    if (!deleteMode) return filteredRecipes;

    return filteredRecipes.filter((r) => {
      if (!currentUserEmail) return false;
      if (isAdmin) return true;

      const { owner } = r;
      if (!owner) return false;

      if (Array.isArray(owner)) {
        return owner.includes(currentUserEmail);
      }

      return owner === currentUserEmail;
    });
  }, [filteredRecipes, deleteMode, currentUserEmail, isAdmin]);

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

          {/* Small toggle to enter "delete mode" */}
          {canAdd && (
            <Button
              variant={deleteMode ? 'outline-danger' : 'outline-secondary'}
              size="sm"
              onClick={() => setDeleteMode((v) => !v)}
            >
              {deleteMode ? 'Cancel' : 'Edit'}
            </Button>
          )}
        </div>
      </div>

      {/* Recipe cards */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {recipesToShow.length > 0 ? (
          recipesToShow.map((r) => {
            const owner = r.owner ?? 'Pantry Pals Team';

            let canDelete = false;
            if (currentUserEmail) {
              if (isAdmin) {
                canDelete = true;
              } else if (Array.isArray(owner)) {
                canDelete = owner.includes(currentUserEmail);
              } else {
                canDelete = owner === currentUserEmail;
              }
            }

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
                  canDelete={canDelete}
                  showDelete={deleteMode}
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

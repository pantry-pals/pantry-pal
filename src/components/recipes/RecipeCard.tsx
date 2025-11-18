'use client';

/* eslint-disable react/require-default-props */
/* eslint-disable no-alert */

import Link from 'next/link';
import { Card, Image, Badge, Button, Row, Col } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import EditRecipeModal from '@/components/recipes/EditRecipeModal';
import { PencilSquare, Trash } from 'react-bootstrap-icons';

export type RecipeCardProps = {
  id: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  cuisine: string;
  dietary: string[];
  ingredients: string[];
  owner: string | string[];
  canEdit: boolean;
  editMode: boolean;
  instructions?: string | null;
  servings?: number | null;
  prepMinutes?: number | null;
  cookMinutes?: number | null;
  sourceUrl?: string | null;
};

export default function RecipeCard({
  id,
  title,
  description = null,
  imageUrl = null,
  cuisine,
  dietary,
  ingredients,
  owner,
  canEdit,
  editMode,
  instructions = null,
  servings = null,
  prepMinutes = null,
  cookMinutes = null,
  sourceUrl = null,
}: RecipeCardProps) {
  const dietTags = Array.isArray(dietary) ? dietary.filter(Boolean) : [];
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const handleDelete = async () => {
    if (!canEdit) return;

    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete recipe');

      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Something went wrong while deleting the recipe.');
    } finally {
      setLoading(false);
    }
  };

  const isAdminOwner = Array.isArray(owner)
    ? owner.includes('admin@foo.com')
    : owner === 'admin@foo.com';

  const ownerLabel = Array.isArray(owner) ? owner.join(', ') : owner;
  const displayOwner = isAdminOwner ? 'Pantry Pals Team' : ownerLabel;

  return (
    <>
      <Card
        className={`recipe-card h-100 d-flex flex-column shadow-sm position-relative ${
          !editMode ? 'clickable-card' : ''
        }`}
        role="button"
        tabIndex={0}
        onClick={() => {
          router.push(`/recipes/${id}`);
        }}
        onKeyDown={(e) => {
          if (!editMode && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            router.push(`/recipes/${id}`);
          }
        }}
      >
        <div className="position-relative">
          <Image
            src={imageUrl || 'https://placehold.co/800x450?text=Recipe'}
            alt={title}
            className="w-100 recipe-card-img"
            fluid
          />
        </div>

        <Card.Body className="d-flex flex-column">
          <div className="flex-grow-1">
            <Card.Title className="recipe-title line-clamp-2">
              <Link
                href={`/recipes/${id}`}
                className="text-decoration-none text-reset"
                onClick={(e) => e.stopPropagation()}
              >
                {title}
              </Link>
            </Card.Title>

            {/* Cuisine + Dietary badges in white body */}
            <div>
              <Badge bg="secondary" pill className="me-2 mb-2">
                {cuisine}
              </Badge>
              {dietTags.map((tag) => (
                <Badge key={tag} bg="secondary" pill className="me-2 mb-2">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="mb-2">
              <Badge bg="light" text="dark">
                {'Made By: '}
                {displayOwner}
              </Badge>
            </div>

            {description && (
              <Card.Text className="text-muted line-clamp-3 mb-2">
                {description}
              </Card.Text>
            )}

            {ingredients?.length > 0 && (
              <Card.Text className="text-muted small line-clamp-2 mb-0">
                <span className="fw-semibold">Ingredients:</span>
                {' '}
                {ingredients.join(', ')}
              </Card.Text>
            )}
          </div>

          <div className="mt-3 d-flex flex-column gap-2">
            {/* This logic is now changed.
              The "View Recipe" button is gone because the card is clickable.
              We only show the "Edit" button if we are in editMode.
            */}
            {editMode && canEdit && (
              <Row>
                <Col xs={6}>
                  <Button
                    variant="primary"
                    className="btn-edit"
                    onClick={(e) => {
                      e.stopPropagation(); // don’t trigger card’s onClick
                      setShowEdit(true);
                    }}
                  >
                    <PencilSquare color="white" size={18} />
                  </Button>
                </Col>
                <Col xs={6}>
                  <Button
                    variant="danger"
                    onClick={(e) => {
                      e.stopPropagation(); // 🔑 don’t trigger card’s onClick
                      handleDelete();
                    }}
                    disabled={loading}
                    className="btn-delete"
                  >
                    {loading ? 'Deleting…' : <Trash color="white" size={18} />}
                  </Button>
                </Col>
              </Row>
            )}
          </div>
        </Card.Body>
      </Card>

      {canEdit && (
        <EditRecipeModal
          show={showEdit}
          onHide={() => setShowEdit(false)}
          recipe={{
            id,
            title,
            cuisine,
            description: description ?? '',
            imageUrl: imageUrl ?? '',
            dietary,
            ingredients,
            instructions: instructions ?? '',
            servings: servings ?? undefined,
            prepMinutes: prepMinutes ?? undefined,
            cookMinutes: cookMinutes ?? undefined,
            sourceUrl: sourceUrl ?? '',
          }}
        />
      )}
    </>
  );
}

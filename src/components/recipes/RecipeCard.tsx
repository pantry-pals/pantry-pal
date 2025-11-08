'use client';

/* eslint-disable react/require-default-props */
/* eslint-disable no-alert */

import Link from 'next/link';
import { Card, Image, Badge, Button } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export type RecipeCardProps = {
  id: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  cuisine: string;
  dietary: string[];
  ingredients: string[];
  owner: string[];
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
}: RecipeCardProps) {
  const dietTags = Array.isArray(dietary) ? dietary.filter(Boolean) : [];
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/recipes/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete recipe');

      // Refresh page or revalidate the list
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Something went wrong while deleting the recipe.');
    } finally {
      setLoading(false);
    }
  };

  const displayOwner = owner.includes('admin@foo.com')
    ? ['Pantry Pals Team']
    : owner;

  return (
    <Card className="recipe-card h-100 d-flex flex-column shadow-sm">
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
          <Card.Title className="recipe-title line-clamp-2">{title}</Card.Title>

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
          <Link href={`/recipes/${id}`} className="btn btn-dark w-100">
            View Recipe
          </Link>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={loading}
            className="w-100"
          >
            {loading ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

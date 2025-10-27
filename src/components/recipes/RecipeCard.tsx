'use client';

import Link from 'next/link';
import { Card, Button, Image, Badge } from 'react-bootstrap';

export type RecipeCardProps = {
  id: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  cuisine: string;
  dietary: string[];
  ingredients: string[];
};

export default function RecipeCard({
                                     id,
                                     title,
                                     description = null,
                                     imageUrl = null,
                                     cuisine,
                                     dietary,
                                     ingredients,
                                   }: RecipeCardProps) {
  const dietTags = Array.isArray(dietary) ? dietary.filter(Boolean) : [];

  return (
    <Card className="recipe-card h-100 d-flex flex-column shadow-sm">
      {/* Image */}
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

          {/* Cuisine + Dietary badges */}
          <div className="mb-3">
            <Badge bg="secondary" pill className="me-2 mb-2">
              {cuisine}
            </Badge>
            {dietTags.map((tag) => (
              <Badge key={tag} bg="secondary" pill className="me-2 mb-2">
                {tag}
              </Badge>
            ))}
          </div>

          {description && (
            <Card.Text className="text-muted line-clamp-3 mb-2">
              {description}
            </Card.Text>
          )}

          {ingredients?.length > 0 && (
            <Card.Text className="text-muted small line-clamp-2 mb-0">
              <span className="fw-semibold">Ingredients:</span>{' '}
              {ingredients.join(', ')}
            </Card.Text>
          )}
        </div>

        <Button
          as={Link}
          href={`/recipes/${id}`}
          className="btn-dark mt-3 w-100"
          type="button"
        >
          View Recipe
        </Button>
      </Card.Body>
    </Card>
  );
}

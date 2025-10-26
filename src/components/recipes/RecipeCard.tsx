'use client';

import { Card, Button, Image } from 'react-bootstrap';

export type RecipeCardProps = {
  id: number;
  title: string;
  // eslint-disable-next-line react/require-default-props
  description?: string | null;
  // eslint-disable-next-line react/require-default-props
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
  return (
    <Card className="h-100 shadow-sm d-flex flex-column">
      <div style={{ position: 'relative', height: 200, width: '100%' }}>
        <Image
          src={imageUrl || 'https://placehold.co/400x200?text=Recipe'}
          alt={title}
          fluid
          style={{ objectFit: 'cover', height: '100%', width: '100%' }}
        />
      </div>
      <Card.Body className="d-flex flex-column flex-grow-1">
        <div className="flex-grow-1">
          <Card.Title>{title}</Card.Title>
          {description && <Card.Text>{description}</Card.Text>}
          <div className="mb-3">
            <small className="text-muted">{cuisine}</small>
            <br />
            {dietary?.length ? (
              <small className="text-muted">{dietary.join(', ')}</small>
            ) : null}
            <br />
            {ingredients?.length ? (
              <>
                <small className="text-muted">Ingredients:</small>
                <br />
                <small className="text-muted">{ingredients.join(', ')}</small>
              </>
            ) : null}
          </div>
        </div>
        <Button href={`/recipes/${id}`} className="btn-dark mt-auto" type="button">
          View Recipe
        </Button>
      </Card.Body>
    </Card>
  );
}

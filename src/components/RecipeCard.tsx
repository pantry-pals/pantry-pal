'use client';

import { Card, Button, Image } from 'react-bootstrap';

export type RecipeCardProps = {
  id: number;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  cuisine: string;
  dietary: string[];
  ingredients: string[];
  isAdmin?: boolean;
  onDelete?: (id: number) => void;
};

export default function RecipeCard(props: RecipeCardProps) {
  const {
    id,
    title,
    description,
    imageUrl,
    cuisine,
    dietary,
    ingredients,
    isAdmin = false,
    onDelete,
  } = props;

  return (
    <Card className="h-100 shadow-sm d-flex flex-column">
      <div style={{ position: 'relative', height: 200, width: '100%' }}>
        <Image
          src={imageUrl || 'https://placehold.co/400x200?text=Recipe'}
          alt={title}
          fluid
          style={{ objectFit: 'cover', height: '100%', width: '100%' }}
        />
        {isAdmin && (
          <Button
            variant="danger"
            size="sm"
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              borderRadius: '50%',
              padding: '0.4rem 0.55rem',
              lineHeight: 1,
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete?.(id);
            }}
          >
            ✕
          </Button>
        )}
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
                <small className="text-muted">
                  {ingredients.join(', ')}
                </small>
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

RecipeCard.defaultProps = {
  description: null,
  imageUrl: null,
  isAdmin: false,
  onDelete: undefined,
};

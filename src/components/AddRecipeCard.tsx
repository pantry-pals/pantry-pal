'use client';

import { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import AddRecipeModal from './AddRecipeModal';

export default function AddRecipeCard() {
  const [show, setShow] = useState(false);

  return (
    <>
      <Card className="h-100 shadow-sm">
        <Card.Body
          className="d-flex flex-column justify-content-center align-items-center text-center"
          style={{ minHeight: 300 }}  // tweak 260–340 to match your other cards
        >
          <Card.Title className="mb-2">Add a New Recipe</Card.Title>
          <Card.Text className="text-muted">Create and share your recipe.</Card.Text>
          <Button className="btn-dark mt-3" onClick={() => setShow(true)}>
            + Add Recipe
          </Button>
        </Card.Body>
      </Card>

      <AddRecipeModal show={show} onHide={() => setShow(false)} />
    </>
  );
}

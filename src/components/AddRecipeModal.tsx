'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { createRecipe } from '@/lib/recipes';
import '../styles/buttons.css'; // same file Edit Produce uses

type Props = {
  show: boolean;
  onHide: () => void;
};

export default function AddRecipeModal({ show, onHide }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dietary, setDietary] = useState(''); // comma-separated
  const [ingredients, setIngredients] = useState(''); // comma-separated

  const handleReset = useCallback(() => {
    setTitle('');
    setCuisine('');
    setDescription('');
    setImageUrl('');
    setDietary('');
    setIngredients('');
  }, []);

  // stable handlers to satisfy react/jsx-no-bind and no-shadow
  const onTitleChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setTitle(evt.target.value),
    [],
  );
  const onCuisineChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setCuisine(evt.target.value),
    [],
  );
  const onDescriptionChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(evt.target.value),
    [],
  );
  const onImageUrlChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setImageUrl(evt.target.value),
    [],
  );
  const onDietaryChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setDietary(evt.target.value),
    [],
  );
  const onIngredientsChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => setIngredients(evt.target.value),
    [],
  );

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setErr(null);

      try {
        await createRecipe({
          title,
          cuisine,
          description,
          imageUrl,
          dietary: dietary.split(',').map((s) => s.trim()).filter(Boolean),
          ingredients: ingredients.split(',').map((s) => s.trim()).filter(Boolean),
        });

        startTransition(() => {
          router.refresh();
          handleReset();
          onHide();
        });
      } catch (error: any) {
        setErr(error?.message ?? 'Failed to create recipe');
      }
    },
    [title, cuisine, description, imageUrl, dietary, ingredients, router, handleReset, onHide, startTransition],
  );

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add a New Recipe</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="text-muted mb-3">Create and share your recipe.</p>
        {err && <Alert variant="danger">{err}</Alert>}

        <Form onSubmit={onSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Title *</Form.Label>
                <Form.Control value={title} onChange={onTitleChange} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Cuisine *</Form.Label>
                <Form.Control value={cuisine} onChange={onCuisineChange} required />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} value={description} onChange={onDescriptionChange} />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Image URL</Form.Label>
                <Form.Control value={imageUrl} onChange={onImageUrlChange} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Dietary (comma-separated)</Form.Label>
                <Form.Control placeholder="Vegan, Gluten-Free" value={dietary} onChange={onDietaryChange} />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-2">
            <Form.Label>Ingredients (comma-separated)</Form.Label>
            <Form.Control
              placeholder="onion, tomato, basil"
              value={ingredients}
              onChange={onIngredientsChange}
            />
          </Form.Group>

          <div className="d-flex gap-2 mt-3">
            {/* same classes as Edit Produce */}
            <Button type="submit" className="btn-submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Submit'}
            </Button>
            <Button type="button" variant="warning" className="btn-reset" onClick={handleReset}>
              Reset
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

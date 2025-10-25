'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { createRecipe } from '@/lib/recipes';
import '../../styles/buttons.css';

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
  const [dietary, setDietary] = useState('');
  const [ingredients, setIngredients] = useState('');

  const handleReset = useCallback(() => {
    setTitle('');
    setCuisine('');
    setDescription('');
    setImageUrl('');
    setDietary('');
    setIngredients('');
  }, []);

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
    [title, cuisine, description, imageUrl, dietary, ingredients, router, handleReset, onHide],
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
                <Form.Control value={title} onChange={(e) => setTitle(e.target.value)} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Cuisine *</Form.Label>
                <Form.Control value={cuisine} onChange={(e) => setCuisine(e.target.value)} required />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Image URL</Form.Label>
                <Form.Control value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Dietary (comma-separated)</Form.Label>
                <Form.Control placeholder="Vegan, Gluten-Free" value={dietary} onChange={(e) => setDietary(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-2">
            <Form.Label>Ingredients (comma-separated)</Form.Label>
            <Form.Control
              placeholder="onion, tomato, basil"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex gap-2 mt-3">
            <Button type="submit" className="btn-submit" disabled={isPending}>
              {isPending ? 'Saving…' : 'Submit'}
            </Button>
            <Button type="button" variant="warning" className="btn-reset" onClick={handleReset}>
              Reset
            </Button>
            <Button type="button" variant="secondary" onClick={onHide}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

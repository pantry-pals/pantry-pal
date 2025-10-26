'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { createRecipe } from '@/lib/recipes';
import '../../styles/buttons.css';

type Props = {
  show: boolean;
  onClose: () => void;
};

export default function AddRecipeModal({ show, onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dietary, setDietary] = useState('');
  const [ingredients, setIngredients] = useState('');

  // NEW fields
  const [instructions, setInstructions] = useState('');
  const [servings, setServings] = useState<number | ''>('');
  const [prepMinutes, setPrepMinutes] = useState<number | ''>('');
  const [cookMinutes, setCookMinutes] = useState<number | ''>('');
  const [sourceUrl, setSourceUrl] = useState('');

  const handleReset = useCallback(() => {
    setTitle('');
    setCuisine('');
    setDescription('');
    setImageUrl('');
    setDietary('');
    setIngredients('');
    setInstructions('');
    setServings('');
    setPrepMinutes('');
    setCookMinutes('');
    setSourceUrl('');
  }, []);

  const handleSubmit = useCallback(
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

          // NEW payload
          instructions,
          servings: servings === '' ? undefined : Number(servings),
          prepMinutes: prepMinutes === '' ? undefined : Number(prepMinutes),
          cookMinutes: cookMinutes === '' ? undefined : Number(cookMinutes),
          sourceUrl,
        });

        startTransition(() => {
          router.refresh();
          handleReset();
          onClose(); // close modal
        });
      } catch (error: any) {
        setErr(error?.message ?? 'Failed to create recipe');
      }
    },
    [
      title, cuisine, description, imageUrl, dietary, ingredients,
      instructions, servings, prepMinutes, cookMinutes, sourceUrl,
      router, handleReset, onClose,
    ],
  );

  return (
    <Modal
      show={show}
      onHide={onClose} // clicking X or backdrop will close
      centered
      size="lg"
      keyboard // allow Esc to close
    >
      <Modal.Header closeButton>
        <Modal.Title>Add a New Recipe</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {err && <Alert variant="danger">{err}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Title *</Form.Label>
                <Form.Control
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Cuisine *</Form.Label>
                <Form.Control
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Image URL</Form.Label>
                <Form.Control
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Dietary (comma-separated)</Form.Label>
                <Form.Control
                  placeholder="Vegan, Gluten-Free"
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Ingredients (comma-separated)</Form.Label>
            <Form.Control
              placeholder="onion, tomato, basil"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
          </Form.Group>

          {/* NEW: Recipe meta */}
          <Row>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Servings</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={servings}
                  onChange={(e) => setServings(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Prep (min)</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={prepMinutes}
                  onChange={(e) => setPrepMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Cook (min)</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={cookMinutes}
                  onChange={(e) => setCookMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-3">
                <Form.Label>Source URL</Form.Label>
                <Form.Control
                  placeholder="https://example.com/recipe"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* NEW: Instructions */}
          <Form.Group className="mb-2">
            <Form.Label>Instructions</Form.Label>
            <Form.Control
              as="textarea"
              rows={8}
              placeholder={'Step 1: ...\nStep 2: ...\nStep 3: ...'}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <Form.Text className="text-muted">
              Tip: Put each step on its own line.
            </Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-between mt-3">
            <Button type="submit" className="btn-add" disabled={isPending}>
              {isPending ? 'Saving…' : 'Submit'}
            </Button>
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

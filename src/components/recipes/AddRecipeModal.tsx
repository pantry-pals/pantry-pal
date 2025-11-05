'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Modal,
  Button,
  Form,
  Alert,
  Row,
  Col,
  InputGroup,
  Image as RBImage,
} from 'react-bootstrap';
import { createRecipe } from '@/lib/recipes';
import ImagePickerModal from '@/components/images/ImagePickerModal';
import '@/styles/buttons.css';

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

  // new fields
  const [instructions, setInstructions] = useState('');
  const [servings, setServings] = useState<number | ''>('');
  const [prepMinutes, setPrepMinutes] = useState<number | ''>('');
  const [cookMinutes, setCookMinutes] = useState<number | ''>('');
  const [sourceUrl, setSourceUrl] = useState('');

  // image picker modal
  const [showPicker, setShowPicker] = useState(false);
  const [imageAlt, setImageAlt] = useState('');

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
    setImageAlt('');
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErr(null);

      try {
        await createRecipe({
          title,
          cuisine,
          description,
          imageUrl,
          dietary: dietary.split(',').map(s => s.trim()).filter(Boolean),
          ingredients: ingredients.split(',').map(s => s.trim()).filter(Boolean),
          instructions,
          servings: servings === '' ? undefined : Number(servings),
          prepMinutes: prepMinutes === '' ? undefined : Number(prepMinutes),
          cookMinutes: cookMinutes === '' ? undefined : Number(cookMinutes),
          sourceUrl: sourceUrl || undefined,
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
    [
      title,
      cuisine,
      description,
      imageUrl,
      dietary,
      ingredients,
      instructions,
      servings,
      prepMinutes,
      cookMinutes,
      sourceUrl,
      router,
      handleReset,
      onHide,
    ],
  );

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg">
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
            <Form.Control as="textarea" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Image URL</Form.Label>
                <InputGroup>
                  <Form.Control
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://…"
                  />
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={() => setShowPicker(true)}
                  >
                    Pick image
                  </Button>
                </InputGroup>
                {imageAlt && (
                  <Form.Text className="text-muted">
                    Alt:
                    {imageAlt}
                  </Form.Text>
                )}
                {imageUrl && (
                  <div className="mt-2">
                    <RBImage
                      src={imageUrl}
                      alt={imageAlt || 'Preview'}
                      style={{ maxHeight: 140, borderRadius: 8, objectFit: 'cover' }}
                      thumbnail
                    />
                  </div>
                )}
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

          <Form.Group className="mb-3">
            <Form.Label>Instructions (one step per line)</Form.Label>
            <Form.Control
              as="textarea"
              rows={6}
              placeholder={'1. Preheat oven...\n2. Mix the dry ingredients...\n3. ...'}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <Form.Text className="text-muted">Line breaks will be preserved on the recipe page.</Form.Text>
          </Form.Group>

          <Row>
            <Col md={4}>
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
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Prep (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={prepMinutes}
                  onChange={(e) => setPrepMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Cook (minutes)</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  value={cookMinutes}
                  onChange={(e) => setCookMinutes(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Source URL (optional)</Form.Label>
            <Form.Control
              type="url"
              placeholder="https://example.com/recipe"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
          </Form.Group>

          <div className="d-flex justify-content-between mt-3">
            <Button type="submit" className="btn-add" disabled={isPending}>
              {isPending ? 'Saving…' : 'Submit'}
            </Button>
            <Button variant="secondary" type="button" onClick={onHide}>Cancel</Button>
          </div>
        </Form>
      </Modal.Body>

      {/* Image picker modal */}
      <ImagePickerModal
        show={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(url, meta) => {
          setImageUrl(url);
          if (meta?.alt) setImageAlt(meta.alt);
        }}
      />
    </Modal>
  );
}

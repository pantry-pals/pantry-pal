'use client';

import { Button, Col, Form, Modal, Row, InputGroup, Offcanvas } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AddShoppingListItemSchema } from '@/lib/validationSchemas';
import { addShoppingListItem } from '@/lib/dbActions';

// ------- types -------
type SL = { id: number; name: string };

type AddItemValues = {
  name: string;
  quantity: number;
  shoppingListId: number;
  price?: number;
  unit?: string;
};

interface Props {
  show: boolean;
  onHide: () => void;
  shoppingLists: SL[];
  sidePanel: boolean;
}

const AddToShoppingListModal = ({ show, onHide, shoppingLists, sidePanel = false }: Props) => {
  const router = useRouter();
  const { data: session } = useSession();
  const owner = session?.user?.email;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddItemValues>({
    resolver: yupResolver(AddShoppingListItemSchema),
    defaultValues: {
      name: '',
      quantity: 0,
      unit: '',
      price: 0,
      shoppingListId: shoppingLists[0]?.id ?? 0,
    },
  });

  useEffect(() => {
    if (!show) reset();
  }, [show, reset]);

  const handleClose = () => {
    reset();
    onHide();
  };

  const onSubmit = async (data: AddItemValues) => {
    if (!owner) {
      swal('Error', 'You must be signed in to add to your shopping list.', 'error');
      return;
    }

    try {
      const price = typeof data.price === 'number'
        ? data.price
        : parseFloat(data.price || '0');

      await addShoppingListItem({
        name: data.name.trim(),
        quantity: Number(data.quantity),
        unit: data.unit || '',
        price,
        shoppingListId: Number(data.shoppingListId),
      });

      swal('Success', 'Item added to your shopping list', 'success', { timer: 2000 });
      handleClose();
      router.refresh();
    } catch (err: any) {
      console.error(err);
      swal('Error', err?.message || 'Something went wrong', 'error');
    }
  };

  // ✅ Define the form once — reuse for both Modal & Offcanvas
  const formContent = (
    <Form noValidate onSubmit={handleSubmit(onSubmit)}>
      {/* Row 1: Item name + Quantity + Unit */}
      <Row className="mb-3">
        <Col xs={6}>
          <Form.Group>
            <Form.Label>Item Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Bananas"
              {...register('name')}
              className={`${errors.name ? 'is-invalid' : ''}`}
            />
            <div className="invalid-feedback">{errors.name?.message}</div>
          </Form.Group>
        </Col>

        <Col xs={3}>
          <Form.Group>
            <Form.Label>Qty</Form.Label>
            <Form.Control
              type="number"
              step={1}
              min={1}
              placeholder="e.g., 2"
              {...register('quantity')}
              className={`${errors.quantity ? 'is-invalid' : ''}`}
            />
            <div className="invalid-feedback">{errors.quantity?.message}</div>
          </Form.Group>
        </Col>

        <Col xs={3}>
          <Form.Group>
            <Form.Label>Unit</Form.Label>
            <Form.Control
              type="text"
              placeholder="pcs, lbs..."
              {...register('unit')}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Row 2: Price + List selection */}
      <Row className="mb-3">
        <Col xs={5}>
          <Form.Group>
            <Form.Label>Price (optional)</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g., 3.49"
                {...register('price', { valueAsNumber: true })}
                className={`${errors.price ? 'is-invalid' : ''}`}
              />
            </InputGroup>
            <div className="invalid-feedback">{errors.price?.message}</div>
          </Form.Group>
        </Col>

        <Col xs={7}>
          <Form.Group>
            <Form.Label>List</Form.Label>
            <Form.Select
              {...register('shoppingListId', { valueAsNumber: true })}
              defaultValue={shoppingLists[0]?.id ?? ''}
              className={`${errors.shoppingListId ? 'is-invalid' : ''}`}
            >
              <option value="">Choose a list…</option>
              {shoppingLists.map((sl) => (
                <option key={sl.id} value={sl.id}>
                  {sl.name}
                </option>
              ))}
            </Form.Select>
            <div className="invalid-feedback">{errors.shoppingListId?.message}</div>
          </Form.Group>
        </Col>
      </Row>

      {/* Buttons */}
      <Row className="pt-3">
        <Col>
          <Button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding…' : 'Submit'}
          </Button>
        </Col>
        <Col>
          <Button
            type="button"
            onClick={() => reset()}
            variant="warning"
            className="btn-reset"
          >
            Reset
          </Button>
        </Col>
      </Row>
    </Form>
  );

  // ✅ Render modal OR side panel depending on prop
  return !sidePanel ? (
  // 👇 Normal centered modal
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header className="justify-content-center">
        <Modal.Title>Add Shopping List Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>{formContent}</Modal.Body>
    </Modal>
  ) : (
  // 👇 Side Offcanvas
    <Offcanvas show={show} onHide={onHide} placement="end" backdrop={false}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Add Shopping List Item</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>{formContent}</Offcanvas.Body>
    </Offcanvas>
  );
};

export default AddToShoppingListModal;

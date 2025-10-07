'use client';

import { Button, Card, Col, Container, Form, Row, InputGroup } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import swal from 'sweetalert';
import { AddToShoppingListSchema } from '@/lib/validationSchemas';
import { addToShoppingList } from '@/lib/dbActions';

type ShoppingListOption = { id: number; name: string };
type Props = {
  shoppingLists: ShoppingListOption[]; // preload server-side (owner-filtered)
  produceNames?: string[]; // optional: preload names for <datalist>
  defaultShoppingListId?: number;
};

type FormData = {
  name: string;
  quantity: number;
  price?: string; // e.g. "3.49"
  shoppingListId: number;
};

const onSubmit = async (data: FormData) => {
  await addToShoppingList({
    name: data.name.trim(),
    quantity: Number(data.quantity),
    price: data.price && data.price.length ? data.price : null,
    shoppingListId: Number(data.shoppingListId),
  });
  swal('Success', 'Item added to your shopping list', 'success', { timer: 2000 });
};

function AddToShoppingList({
  shoppingLists,
  produceNames = [],
  defaultShoppingListId,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: yupResolver(AddToShoppingListSchema),
    defaultValues: {
      name: '',
      quantity: undefined as unknown as number,
      price: '',
      shoppingListId: (defaultShoppingListId ?? '') as unknown as number,
    },
  });

  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Col className="text-center"><h2>Add to Shopping List</h2></Col>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Form.Group className="mb-3">
                  <Form.Label>Produce</Form.Label>
                  <input
                    type="text"
                    list="produce-options"
                    placeholder="e.g., Bananas"
                    {...register('name')}
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                    required
                    autoComplete="off"
                  />
                  <datalist id="produce-options">
                    {produceNames.slice(0, 100).map((n) => (
                      <option key={n} value={n} aria-label={n} />
                    ))}
                  </datalist>
                  <div className="invalid-feedback">{errors.name?.message}</div>
                </Form.Group>

                <Row className="g-2">
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Quantity</Form.Label>
                      <input
                        type="number"
                        min={1}
                        {...register('quantity')}
                        className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                        placeholder="e.g., 2"
                        required
                      />
                      <div className="invalid-feedback">{errors.quantity?.message}</div>
                    </Form.Group>
                  </Col>
                  <Col md={8}>
                    <Form.Group className="mb-3">
                      <Form.Label>Shopping List</Form.Label>
                      <select
                        {...register('shoppingListId')}
                        className={`form-control ${errors.shoppingListId ? 'is-invalid' : ''}`}
                        defaultValue={defaultShoppingListId ?? ''}
                        required
                      >
                        <option value="">Choose…</option>
                        {shoppingLists.map((sl) => (
                          <option key={sl.id} value={sl.id}>{sl.name}</option>
                        ))}
                      </select>
                      <div className="invalid-feedback">{errors.shoppingListId?.message}</div>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Price (optional)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <input
                      type="text"
                      placeholder="e.g., 3.49"
                      {...register('price')}
                      className={`form-control ${errors.price ? 'is-invalid' : ''}`}
                    />
                    <div className="invalid-feedback">{errors.price?.message}</div>
                  </InputGroup>
                </Form.Group>

                <Row className="pt-2">
                  <Col>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Adding…' : 'Submit'}
                    </Button>
                  </Col>
                  <Col className="text-end">
                    <Button
                      type="button"
                      onClick={() => reset()}
                      variant="warning"
                    >
                      Reset
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

AddToShoppingList.defaultProps = {
  defaultShoppingListId: undefined,
  produceNames: [],
};

export default AddToShoppingList;

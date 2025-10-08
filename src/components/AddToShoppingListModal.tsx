'use client';

import { Button, Col, Form, Modal, Row, InputGroup } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { yupResolver } from '@hookform/resolvers/yup';
import { InferType } from 'yup';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import '../styles/buttons.css';

// import your schema & server actions
import { AddShoppingListItemSchema } from '@/lib/validationSchemas';
import { addShoppingListItem, addShoppingList } from '@/lib/dbActions';

// ------- types -------
type SL = { id: number; name: string };

type AddItemValues = InferType<typeof AddShoppingListItemSchema> & {
  newListName?: string;
  name: string; // produce name typed in form
};

interface Props {
  show: boolean;
  onHide: () => void;
  shoppingLists: SL[];
  produceNames?: string[];
}

const AddToShoppingListModal = ({ show, onHide, shoppingLists, produceNames = [] }: Props) => {
  const router = useRouter();
  const [creatingList, setCreatingList] = useState(false);

  const produceSet = useMemo(() => new Set(produceNames.map((n) => n.trim().toLowerCase())), [produceNames]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      quantity: '',
      price: '',
      shoppingListId: shoppingLists[0]?.id ?? '',
      newListName: '',
    },
  });

  useEffect(() => {
    if (!show) {
      reset();
      setCreatingList(false);
    }
  }, [show, reset]);

  const handleClose = () => {
    reset();
    setCreatingList(false);
    onHide();
  };

  // --- helper: find or create Produce before making list item ---
  async function getOrCreateProduce(name: string) {
    try {
      const res = await fetch('/api/produce/find-or-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error('Failed to fetch or create produce');
      const produce = await res.json();
      return produce;
    } catch (err) {
      console.error(err);
      throw new Error('Error creating produce');
    }
  }

  const onSubmit = async (data: AddItemValues) => {
    console.log('✅ Form submitted!', data);
    const hasExisting = !!data.shoppingListId;
    const hasNew = !!data.newListName && data.newListName.trim().length > 0;

    if (!hasExisting && !hasNew) {
      swal('Missing list', 'Choose a shopping list or enter a new list name.', 'warning');
      return;
    }

    try {
      // 1️⃣ ensure shopping list exists or create new
      let shoppingListId: number;
      if (hasNew) {
        const created = await addShoppingList({ name: data.newListName!.trim() });
        shoppingListId = created.id;
      } else {
        shoppingListId = Number(data.shoppingListId);
      }

      // 2️⃣ ensure a produce record exists (get its ID)
      const produce = await getOrCreateProduce(data.name.trim());

      // 3️⃣ parse & normalize price
      const price = typeof data.price === 'number'
        ? data.price
        : parseFloat(data.price || '0');

      // 4️⃣ submit shopping list item
      await addShoppingListItem({
        produceId: produce.id,
        quantity: Number(data.quantity),
        shoppingListId,
        price,
      });

      swal('Success', 'Item added to your shopping list', 'success', { timer: 2000 });
      handleClose();
      router.refresh();
    } catch (err: any) {
      console.error(err);
      swal('Error', err?.message || 'Something went wrong', 'error');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="justify-content-center">
        <Modal.Title>Add Shopping List Item</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
          {/* Row 1: Item name + Quantity */}
          <Row className="mb-3">
            <Col xs={8} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0">Item</Form.Label>
                <Form.Control
                  type="text"
                  list="produce-options"
                  placeholder="e.g., Bananas"
                  {...register('name')}
                  className={`${errors.name ? 'is-invalid' : ''}`}
                  autoComplete="off"
                />
                <datalist id="produce-options">
                  {produceNames.slice(0, 100).map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
                <div className="invalid-feedback">{errors.name?.message}</div>
              </Form.Group>
            </Col>

            <Col xs={4} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0">Qty</Form.Label>
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
          </Row>

          {/* Row 2: Price + List select/create */}
          <Row className="mb-3">
            <Col xs={5} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0">Price (optional)</Form.Label>
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

            <Col xs={7} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0">List</Form.Label>

                {!creatingList ? (
                  <Form.Select
                    {...register('shoppingListId', { valueAsNumber: true })}
                    defaultValue={shoppingLists[0]?.id ?? ''}
                    className={`${errors.shoppingListId ? 'is-invalid' : ''}`}
                  >
                    <option value="">Choose…</option>
                    {shoppingLists.map((sl) => (
                      <option key={sl.id} value={sl.id}>
                        {sl.name}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <Form.Control
                    type="text"
                    placeholder="New list name"
                    {...register('newListName')}
                    className={`${errors.shoppingListId ? 'is-invalid' : ''}`}
                    onChange={(e) => {
                      if (e.target.value.length) setValue('shoppingListId', '' as unknown as number);
                    }}
                  />
                )}

                <Form.Check
                  type="switch"
                  id="create-list-switch"
                  className="mt-2"
                  label="Create new list"
                  checked={creatingList}
                  onChange={(e) => {
                    setCreatingList(e.currentTarget.checked);
                    setValue('shoppingListId', '' as unknown as number);
                    setValue('newListName', '');
                  }}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Buttons */}
          <Form.Group className="form-group">
            <Row className="pt-3">
              <Col>
                <Button type="submit" className="btn-submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding…' : 'Submit'}
                </Button>
              </Col>
              <Col>
                <Button type="button" onClick={() => reset()} variant="warning" className="btn-reset">
                  Reset
                </Button>
              </Col>
            </Row>
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddToShoppingListModal;

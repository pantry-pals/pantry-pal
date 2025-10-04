'use client';

import { Button, Col, Form, Modal, Row, Table } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import * as yup from 'yup';
import { editShoppingList, deleteShoppingListItem } from '@/lib/dbActions';
import '../../styles/buttons.css';

// Validation schema for editing shopping list
const EditShoppingListSchema = yup.object({
  id: yup.number().required(),
  name: yup.string().required('Name is required'),
  owner: yup.string().required(),
});

type ShoppingListValues = yup.InferType<typeof EditShoppingListSchema>;

interface EditShoppingListModalProps {
  show: boolean;
  onHide: () => void;
  shoppingList: any;
}

const EditShoppingListModal = ({ show, onHide, shoppingList }: EditShoppingListModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShoppingListValues>({
    resolver: yupResolver(EditShoppingListSchema),
  });

  const router = useRouter();

  // Reset form values every time modal closes or shopping list changes
  useEffect(() => {
    if (!show) {
      reset({
        id: shoppingList.id,
        name: shoppingList.name,
        owner: shoppingList.owner,
      });
    }
  }, [show, shoppingList, reset]);

  const handleClose = () => {
    reset({
      id: shoppingList.id,
      name: shoppingList.name,
      owner: shoppingList.owner,
    });
    onHide();
  };

  const onSubmit = async (data: ShoppingListValues) => {
    try {
      await editShoppingList(data);
      swal('Success', 'Your shopping list has been updated', 'success', {
        timer: 2000,
      });
      handleClose();
      router.refresh();
    } catch (error) {
      console.error('Error updating shopping list:', error);
      swal('Error', 'Failed to update shopping list', 'error');
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await deleteShoppingListItem(itemId);
      swal('Success', 'Item removed from shopping list', 'success', {
        timer: 2000,
      });
      router.refresh();
      handleClose();
    } catch (error) {
      console.error('Error removing item:', error);
      swal('Error', 'Failed to remove item', 'error');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header className="justify-content-center">
        <Modal.Title>Edit Shopping List</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('id')} value={shoppingList.id} />
          <Row className="mb-3">
            <Col className="text-center">
              <Form.Group>
                <Form.Label className="mb-0">List Name</Form.Label>
                <Form.Control
                  type="text"
                  {...register('name')}
                  defaultValue={shoppingList.name}
                  required
                  className={`${errors.name ? 'is-invalid' : ''}`}
                  placeholder="e.g., Weekly Groceries"
                />
                <div className="invalid-feedback">{errors.name?.message}</div>
              </Form.Group>
            </Col>
          </Row>

          {/* Display items in the shopping list */}
          {shoppingList.items && shoppingList.items.length > 0 && (
            <Row className="mb-3">
              <Col>
                <h6>Items in List:</h6>
                <Table striped bordered hover size="sm">
                  <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                  </thead>
                  <tbody>
                  {shoppingList.items.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item.produce.name}</td>
                      <td>
                        {item.quantity} {item.produce.unit}
                      </td>
                      <td>
                        {item.price ? `$${parseFloat(item.price.toString()).toFixed(2)}` : 'N/A'}
                      </td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </Table>
              </Col>
            </Row>
          )}

          <input type="hidden" {...register('owner')} value={shoppingList.owner} />
          <Form.Group className="form-group">
            <Row className="pt-3">
              <Col>
                <Button type="button" onClick={() => reset()} variant="warning" className="btn-reset">
                  Reset
                </Button>
              </Col>
              <Col>
                <Button type="submit" className="btn-submit">
                  Update List
                </Button>
              </Col>
            </Row>
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditShoppingListModal;

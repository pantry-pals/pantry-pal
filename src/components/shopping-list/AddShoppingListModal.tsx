'use client';

import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import * as yup from 'yup';
import { addShoppingList } from '@/lib/dbActions';
import '../../styles/buttons.css';

// Validation schema for adding shopping list
const AddShoppingListSchema = yup.object({
  name: yup.string().required('Name is required'),
  owner: yup.string().required(),
});

type ShoppingListValues = yup.InferType<typeof AddShoppingListSchema>;

interface AddShoppingListModalProps {
  show: boolean;
  onHide: () => void;
  owner: string;
}

const AddShoppingListModal = ({ show, onHide, owner }: AddShoppingListModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShoppingListValues>({
    resolver: yupResolver(AddShoppingListSchema),
    defaultValues: {
      owner,
    },
  });

  const router = useRouter();

  // Reset form values every time modal closes
  useEffect(() => {
    if (!show) {
      reset();
    }
  }, [show, reset]);

  const handleClose = () => {
    reset();
    onHide();
  };

  const onSubmit = async (data: ShoppingListValues) => {
    try {
      await addShoppingList(data);
      swal('Success', 'Your shopping list has been created', 'success', {
        timer: 2000,
      });
      handleClose();
    } catch (error) {
      console.error('Error creating shopping list:', error);
      swal('Error', 'Failed to create shopping list', 'error');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="justify-content-center">
        <Modal.Title>Create Shopping List</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row className="mb-3">
            <Col className="text-center">
              <Form.Group>
                <Form.Label className="mb-0">List Name</Form.Label>
                <Form.Control
                  type="text"
                  {...register('name')}
                  required
                  className={`${errors.name ? 'is-invalid' : ''}`}
                  placeholder="e.g., Weekly Groceries"
                />
                <div className="invalid-feedback">{errors.name?.message}</div>
              </Form.Group>
            </Col>
          </Row>
          <input type="hidden" {...register('owner')} value={owner} />
          <Form.Group className="form-group">
            <Row className="pt-3">
              <Col>
                <Button type="button" onClick={() => reset()} variant="warning" className="btn-reset">
                  Reset
                </Button>
              </Col>
              <Col>
                <Button type="submit" className="btn-submit">
                  Create List
                </Button>
              </Col>
            </Row>
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddShoppingListModal;

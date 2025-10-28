'use client';

import { useState } from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import { deleteProduce } from '@/lib/dbActions';
import '../../styles/buttons.css';
import type { Produce } from '@prisma/client';

type DeleteProduce = Pick<
Produce,
| 'id'
| 'name'
| 'quantity'
| 'unit'
| 'type'
| 'location'
| 'storage'
| 'expiration'
| 'owner'
| 'image'
> & {
  restockThreshold?: number | null;
};

interface DeleteProduceModalProps {
  show: boolean;
  onHide: () => void;
  produce: DeleteProduce;
}

const DeleteProduceModal = ({ show, onHide, produce }: DeleteProduceModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteProduce(produce.id);
      onHide(); // close after successful delete
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error deleting produce:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header className="justify-content-center">
        <Modal.Title>{`Delete ${produce.name}`}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Row className="mb-1">
          <Col className="text-center">
            <h5 className="fw-bold">Are you sure you want to delete this item?</h5>
            <p className="text-danger fw-semibold mt-2">This action cannot be undone.</p>
          </Col>
        </Row>

        <Row className="pt-4">
          <Col className="text-center">
            <Button
              onClick={onHide}
              variant="secondary"
              className="btn-submit"
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </Col>
          <Col className="text-center">
            <Button
              onClick={handleDelete}
              variant="danger"
              className="btn-submit"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteProduceModal;

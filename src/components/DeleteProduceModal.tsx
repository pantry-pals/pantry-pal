'use client';

import { useState, useTransition } from 'react';
import { Button, Col, Modal, Row } from 'react-bootstrap';
import { deleteProduce } from '@/lib/dbActions';
import '../styles/buttons.css';
import { Produce } from '@prisma/client';

interface DeleteProduceModalProps {
  show: boolean;
  onHide: () => void;
  produce: Produce & { restockThreshold?: number | null };
}

const DeleteProduceModal = ({ show, onHide, produce }: DeleteProduceModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      startTransition(async () => {
        await deleteProduce(produce.id);
      });
    } catch (err) {
      console.error('Error deleting produce:', err);
      setIsDeleting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header className="justify-content-center">
        <Modal.Title>
          {`Delete ${produce.name}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-1">
          <Col className="text-center">
            <h5 className="fw-bold">
              Are you sure you want to delete this item?
            </h5>
            <p className="text-danger fw-semibold mt-2">
              This action cannot be undone.
            </p>
          </Col>
        </Row>
        <Row className="pt-4">
          <Col className="text-center">
            <Button
              onClick={onHide}
              variant="secondary"
              className="btn-submit"
              disabled={isDeleting || isPending}
            >
              Cancel
            </Button>
          </Col>
          <Col className="text-center">
            <Button
              onClick={handleDelete}
              variant="danger"
              className="btn-submit"
              disabled={isDeleting || isPending}
            >
              {isDeleting || isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default DeleteProduceModal;

'use client';

import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useState } from 'react';
import { Produce } from '@prisma/client';
import AddProduceModal from './produce/AddProduceModal';

const AddStuffForm = ({ id, name, quantity, unit, type, location, storage, expiration, owner, image }: Produce) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col xs={5}>
          <Col className="text-center">
            <h2>Add Stuff</h2>
          </Col>
          <Card>
            <Card.Body>
              <Button onClick={() => setShowModal(true)}>Add New Item</Button>
            </Card.Body>

            {/* Modal component for editing produce item */}
            <AddProduceModal
              show={showModal}
              onHide={() => setShowModal(false)}
              produce={{
                id,
                name,
                quantity,
                unit,
                type,
                location,
                storage,
                expiration,
                owner,
                image,
                restockThreshold: 1,
              }}
            />
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddStuffForm;

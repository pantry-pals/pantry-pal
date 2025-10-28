'use client';

import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { useState } from 'react';
import type { Produce } from '@prisma/client';
import AddProduceModal from './produce/AddProduceModal';

const AddStuffForm = ({
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
}: Produce) => {
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
                // keep only fields AddProduceModal accepts
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

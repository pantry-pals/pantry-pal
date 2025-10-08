'use client';

import { Button, Col, Container, Row } from 'react-bootstrap';
import { useState } from 'react';
import AddProduceModal from './AddProduceModal';
import ProduceListWithGrouping from './SearchBar'; // client component
import '../styles/buttons.css';

function PantryClient({ initialProduce, owner }: { initialProduce: any[]; owner: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <main>
      <Container id="view-pantry" className="py-3">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h1>Your Pantry at a Glance</h1>
            <Button className="btn-add" onClick={() => setShowModal(true)}>
              + Add Item
            </Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <ProduceListWithGrouping initialProduce={initialProduce} />
          </Col>
        </Row>
      </Container>

      {/* Modal */}
      <AddProduceModal
        show={showModal}
        onHide={() => setShowModal(false)}
        produce={{
          id: 0,
          name: '',
          type: '',
          location: '',
          quantity: 0,
          unit: 'kg',
          expiration: null,
          image: null,
          owner,
          restockThreshold: 0,
        }}
      />
    </main>
  );
}
export default PantryClient;

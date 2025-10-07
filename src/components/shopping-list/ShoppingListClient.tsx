'use client';

import { Button, Col, Container, Row } from 'react-bootstrap';
import { useState } from 'react';
import AddShoppingListModal from './AddShoppingListModal';
import ShoppingListView from './ShoppingListView';
import '../../styles/buttons.css';

function ShoppingListClient({ initialShoppingLists, owner }: { initialShoppingLists: any[]; owner: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <main>
      <Container id="view-shopping-list" className="py-3">
        <Row className="mb-3">
          <Col className="d-flex justify-content-between align-items-center">
            <h1>Your Shopping Lists</h1>
            <Button className="btn-add" onClick={() => setShowModal(true)}>+ Add List</Button>
          </Col>
        </Row>
        <Row>
          <Col>
            <ShoppingListView initialShoppingLists={initialShoppingLists} />
          </Col>
        </Row>
      </Container>

      {/* Modal */}
      <AddShoppingListModal
        show={showModal}
        onHide={() => setShowModal(false)}
        owner={owner}
      />
    </main>
  );
}

export default ShoppingListClient;

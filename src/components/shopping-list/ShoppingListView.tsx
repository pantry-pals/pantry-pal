'use client';

import { useState } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import ShoppingListCard from './ShoppingListCard';
import AddToShoppingListModal from '../AddToShoppingListModal';

type ShoppingListViewProps = {
  initialShoppingLists: any[];
};

export default function ShoppingListView({ initialShoppingLists }: ShoppingListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [show, setShow] = useState(false);

  const filteredLists = initialShoppingLists.filter((list) => (
    list.name.toLowerCase().includes(searchTerm.toLowerCase())
  ));

  return (
    <>
      <Row className="mb-4 align-items-center">
        <Col xs={12} md={8} className="mb-2 mb-md-0">
          <Form.Control
            type="text"
            placeholder="Search shopping lists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
        <Col xs={12} md="auto" className="mt-2 mt-md-0 text-md-end">
          <Button onClick={() => setShow(true)} className="addbutton">+ Add Item to List</Button>
          <AddToShoppingListModal
            show={show}
            onHide={() => setShow(false)}
            shoppingLists={initialShoppingLists}
          />
        </Col>
      </Row>

      {filteredLists.length === 0 ? (
        <Row>
          <Col className="text-center">
            <p className="text-muted">No shopping lists found. Create one to get started!</p>
          </Col>
        </Row>
      ) : (
        <Row>
          {filteredLists.map((list) => (
            <Col key={list.id} md={6} lg={4} className="mb-4">
              <ShoppingListCard shoppingList={list} />
            </Col>
          ))}
        </Row>
      )}
    </>
  );
}

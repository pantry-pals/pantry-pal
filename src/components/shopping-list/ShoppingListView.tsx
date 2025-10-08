'use client';

import { useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import ShoppingListCard from './ShoppingListCard';

type ShoppingListViewProps = {
  initialShoppingLists: any[];
};

export default function ShoppingListView({ initialShoppingLists }: ShoppingListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLists = initialShoppingLists.filter((list) => (
    list.name.toLowerCase().includes(searchTerm.toLowerCase())
  ));

  return (
    <>
      <Row className="mb-4">
        <Col md={6} className="mx-auto">
          <Form.Control
            type="text"
            placeholder="Search shopping lists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

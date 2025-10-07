'use client';

import { Card, ListGroup, Button, Badge } from 'react-bootstrap';
import Link from 'next/link';
import { useState } from 'react';
import EditShoppingListModal from './EditShoppingListModal';
import { Trash } from "react-bootstrap-icons";


type ShoppingListCardProps = {
  shoppingList: any;
};

const formatDate = (d?: Date | string | null) => {
  if (!d) return 'Not Available';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return 'Not Available';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function ShoppingListCard({ shoppingList }: ShoppingListCardProps) {
  const [showModal, setShowModal] = useState(false);
  const totalItems = shoppingList.items?.length || 0;
  const totalCost = shoppingList.items?.reduce((sum: number, item: any) => {
    const price = item.price ? parseFloat(item.price.toString()) : 0;
    return sum + (price * item.quantity);
  }, 0) || 0;

  return (
    <Card className="h-100 mb-3 image-shadow">
      <Card.Header>
        <Link href={`/shoppinglist/${shoppingList.id}`} className="link-dark">
          <Card.Title className="mt-2">{shoppingList.name}</Card.Title>
        </Link>
      </Card.Header>

      <Card.Body className="bg-light">
        <ListGroup variant="flush">
          <ListGroup.Item className="bg-light">
            <strong>Date Created:</strong>
            {' '}
            {formatDate(shoppingList.createdAt)}
          </ListGroup.Item>
          <ListGroup.Item className="bg-light">
            <strong>Total Items:</strong>
            {' '}
            <Badge bg="primary">{totalItems}</Badge>
          </ListGroup.Item>
          <ListGroup.Item className="bg-light">
            <strong>Estimated Cost:</strong>
            {' '}
            ${totalCost.toFixed(2)}
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>

      <Card.Footer className="d-flex">
        <Button className="me-2 editbutton" onClick={() => setShowModal(true)}>
          View
        </Button>
        <Button
          variant="danger"
          className="deletebutton d-flex align-items-center justify-content-center"
          href={`/shoppinglist/delete/${shoppingList.id}`}
          style={{ width: '40px', height: '40px', padding: 0 }}
        >
          <Trash color="white" size={18} />
        </Button>
      </Card.Footer>

      <EditShoppingListModal
        show={showModal}
        onHide={() => setShowModal(false)}
        shoppingList={shoppingList}
      />
    </Card>
  );
}

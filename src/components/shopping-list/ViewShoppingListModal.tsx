'use client';

import { Button, Col, Modal, Row, Table } from 'react-bootstrap';
import '../../styles/buttons.css';

interface ViewShoppingListModalProps {
  show: boolean;
  onHide: () => void;
  shoppingList: any;
}

const ViewShoppingListModal = ({ show, onHide, shoppingList }: ViewShoppingListModalProps) => (
  <Modal show={show} onHide={onHide} centered size="lg">
    <Modal.Header className="justify-content-center">
      <Modal.Title>View Shopping List</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      {/* Shopping list name header */}
      <Row className="mb-4">
        <Col className="text-center">
          <h5 className="fw-bold">{shoppingList?.name || 'Untitled List'}</h5>
        </Col>
      </Row>

      {/* Display items in the shopping list */}
      {shoppingList?.items && shoppingList.items.length > 0 ? (
        <Row>
          <Col>
            <h6>Items in List:</h6>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {shoppingList.items.map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      {item.quantity}
                      {' '}
                      {item.unit || '—'}
                    </td>
                    <td>
                      {item.price
                        ? `$${parseFloat(item.price.toString()).toFixed(2)}`
                        : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      ) : (
        <Row>
          <Col className="text-center">
            <p className="text-muted mb-0">No items in this shopping list.</p>
          </Col>
        </Row>
      )}

      {/* Close button */}
      <Row className="pt-4">
        <Col className="text-center">
          <Button onClick={onHide} variant="secondary" className="btn-submit">
            Close
          </Button>
        </Col>
      </Row>
    </Modal.Body>
  </Modal>
);

export default ViewShoppingListModal;

'use client';

import { useState, useEffect } from 'react';
import { Button, Col, Modal, Row, Table } from 'react-bootstrap';
import '../../styles/buttons.css';

interface ViewShoppingListModalProps {
  show: boolean;
  onHide: () => void;
  shoppingList: any;
}

const ViewShoppingListModal = ({ show, onHide, shoppingList }: ViewShoppingListModalProps) => {
  const [items, setItems] = useState(shoppingList?.items || []);
  useEffect(() => {
    if (shoppingList?.items) {
      setItems(shoppingList.items);
    }
  }, [shoppingList]);

  const handleRestockChange = async (produceId: number, restockTrigger: string) => {
    setItems((prev) =>
      prev.map((item: any) =>
        item.produce.id === produceId ? { ...item, produce: { ...item.produce, restockTrigger } } : item,
      ),
    );
    await fetch(`/api/produce/${produceId}/restock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restockTrigger }),
    });
  };
  const handleThresholdChange = async (produceId: number, customThreshold: number) => {
    // eslint-disable-next-line max-len
    setItems((prev: any[]) =>
      prev.map((item: any) =>
        item.produce.id === produceId ? { ...item, produce: { ...item.produce, customThreshold } } : item,
      ),
    );

    await fetch(`/api/produce/${produceId}/restock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customThreshold }),
    });
  };

  return (
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

        {/* Display items in the shopping list along with quantity and price */}
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
                    <th>Restock When</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item.produce.name}</td>
                      <td>
                        {item.quantity} {item.produce.unit}
                      </td>
                      <td>{item.price ? `$${parseFloat(item.price.toString()).toFixed(2)}` : 'N/A'}</td>
                      <td>
                        <select
                          value={item.produce.restockTrigger || 'empty'}
                          onChange={(e) => handleRestockChange(item.produce.id, e.target.value)}
                          className="form-select form-select-sm"
                        >
                          <option value="empty">When empty</option>
                          <option value="half">When half gone</option>
                          <option value="custom">Custom % left</option>
                        </select>

                        {item.produce.restockTrigger === 'custom' && (
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={item.produce.customThreshold || ''}
                            onChange={(e) => handleThresholdChange(item.produce.id, parseFloat(e.target.value))}
                            className="form-control form-control-sm mt-1"
                            placeholder="% left"
                          />
                        )}
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
};

export default ViewShoppingListModal;

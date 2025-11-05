/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */

'use client';

import { useState, useEffect } from 'react';
import { Button, Col, Modal, Row, Table } from 'react-bootstrap';
import AddToShoppingListModal from './AddToShoppingListModal';

interface ShoppingListItem {
  id: number;
  name: string;
  quantity: number;
  unit?: string | null;
  price?: number | null;
  restockTrigger?: string | null;
  customThreshold?: number | null;
}

interface ShoppingList {
  id: number;
  name: string;
  items?: ShoppingListItem[];
}

interface ViewShoppingListModalProps {
  show: boolean;
  onHide: () => void;
  shoppingList?: ShoppingList; // 👈 make optional for safety
}

const ViewShoppingListModal = ({ show, onHide, shoppingList }: ViewShoppingListModalProps) => {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Update items when the shopping list changes
  useEffect(() => {
    if (shoppingList?.items) {
      setItems(shoppingList.items);
    }
  }, [shoppingList]);

  const handleRestockChange = async (itemId: number, restockTrigger: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, restockTrigger } : item)),
    );

    await fetch(`/api/shopping-list-item/${itemId}/restock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restockTrigger }),
    });
  };

  const handleThresholdChange = async (itemId: number, customThreshold: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, customThreshold } : item)),
    );

    await fetch(`/api/shopping-list-item/${itemId}/restock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customThreshold }),
    });
  };

  // 🧠 If no list data, render nothing to avoid errors
  if (!shoppingList) return null;

  return (
    <>
      {/* Main View Shopping List Modal */}
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header className="justify-content-center">
          <Modal.Title>{shoppingList?.name ?? 'Shopping List'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {/* Items Table */}
          {items.length > 0 ? (
            <Row>
              <Col>
                <Table striped bordered hover size="sm" responsive>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                      <th>Price</th>
                      <th>Restock When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit || '-'}</td>
                        <td>{item.price ? `$${Number(item.price).toFixed(2)}` : 'N/A'}</td>
                        <td>
                          <select
                            value={item.restockTrigger || 'empty'}
                            onChange={(e) => handleRestockChange(item.id, e.target.value)}
                            className="form-select form-select-sm"
                          >
                            <option value="empty">When empty</option>
                            <option value="half">When half gone</option>
                            <option value="custom">Custom % left</option>
                          </select>

                          {item.restockTrigger === 'custom' && (
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={item.customThreshold || ''}
                              onChange={(e) =>
                                handleThresholdChange(item.id, parseFloat(e.target.value))}
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

          {/* Footer Buttons */}
          <Row className="pt-4">
            <Col className="text-center">
              <Button
                variant="success"
                style={{ backgroundColor: 'var(--fern-green)' }}
                className="btn-submit"
                onClick={() => setShowAddModal(true)}
              >
                + Add Item
              </Button>
            </Col>

            <Col className="text-center">
              <Button onClick={onHide} variant="secondary" className="btn-submit">
                Close
              </Button>
            </Col>
          </Row>
        </Modal.Body>
      </Modal>

      {/* ✅ AddToShoppingListModal rendered as a sibling, NOT inside the modal */}
      <AddToShoppingListModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        shoppingLists={[shoppingList]}
        sidePanel
      />
    </>
  );
};

ViewShoppingListModal.defaultProps = {
  shoppingList: {
    id: 0,
    name: '',
    items: [],
  },
};

export default ViewShoppingListModal;

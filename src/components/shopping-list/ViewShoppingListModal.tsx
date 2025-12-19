/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */

'use client';

import { useState, useEffect } from 'react';
import { Button, Col, Modal, Row, Table } from 'react-bootstrap';
import AddToShoppingListModal from './AddToShoppingListModal';
import EditShoppingListItemModal from './EditShoppingListItemModal';

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
  shoppingList?: ShoppingList; // optional for safety
}

const ViewShoppingListModal = ({ show, onHide, shoppingList }: ViewShoppingListModalProps) => {
  const [items, setItems] = useState<ShoppingListItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [checkedState, setCheckedState] = useState<Record<number, boolean>>({});
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);

  // Update items when the shopping list changes
  useEffect(() => {
    if (shoppingList?.items) {
      setItems(shoppingList.items);
      const saved = localStorage.getItem(`checkboxes-${shoppingList.id}`);
      if (saved) setCheckedState(JSON.parse(saved));
    }
  }, [shoppingList]);

  const handleRestockChange = async (itemId: number, restockTrigger: string) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, restockTrigger } : item)));

    await fetch(`/api/shopping-list-item/${itemId}/restock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restockTrigger }),
    });
  };

  const handleThresholdChange = async (itemId: number, customThreshold: number) => {
    setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, customThreshold } : item)));

    await fetch(`/api/shopping-list-item/${itemId}/restock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customThreshold }),
    });
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      setDeletingItemId(itemId);
      await fetch(`/api/shopping-list-item/${itemId}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    } catch (err) {
      console.error('Failed to delete item:', err);
    } finally {
      setDeletingItemId(null);
    }
  };

  const toggleCheckbox = (itemId: number) => {
    setCheckedState((prev) => {
      const updated = { ...prev, [itemId]: !prev[itemId] };

      if (shoppingList) {
        localStorage.setItem(`checkboxes-${shoppingList.id}`, JSON.stringify(updated));
      }

      return updated;
    });
  };

  if (!shoppingList) return null;

  return (
    <>
      <Modal show={show} onHide={onHide} centered size="lg">
        <Modal.Header className="justify-content-center">
          <Modal.Title>{shoppingList?.name ?? 'Shopping List'}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {items.length > 0 ? (
            <Row>
              <Col>
                <Table striped bordered hover size="sm" responsive className="text-center">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Unit</th>
                      <th>Price</th>
                      <th style={{ width: 160 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{item.unit || '-'}</td>
                        <td>{item.price ? `$${Number(item.price).toFixed(2)}` : 'N/A'}</td>
                        <td className="d-flex gap-2 justify-content-center">
                          <Button className="btn-submit" size="sm" type="button" onClick={() => setEditingItem(item)}>
                            Edit
                          </Button>

                          <Button
                            variant="danger"
                            size="sm"
                            className="btn-delete"
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={deletingItemId === item.id}
                          >
                            {deletingItemId === item.id ? 'Deleting...' : 'Delete'}
                          </Button>
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

          <Row className="pt-4">
            <Col className="text-center">
              <Button
                variant="success"
                style={{ backgroundColor: 'var(--fern-green)' }}
                className="btn-submit"
                onClick={() => {
                  onHide();
                  setShowAddModal(true);
                }}
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

      <AddToShoppingListModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        shoppingLists={[shoppingList]}
        sidePanel={false}
        prefillName=""
      />
      {editingItem && (
        <EditShoppingListItemModal show={!!editingItem} onHide={() => setEditingItem(null)} item={editingItem} />
      )}
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

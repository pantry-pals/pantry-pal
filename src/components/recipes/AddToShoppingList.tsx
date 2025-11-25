'use client';

import React, { useState, useCallback } from 'react';
import { Button, Spinner } from 'react-bootstrap';

type Props = {
  missingItems: string[];
};

export default function AddToShoppingList({ missingItems }: Props) {
  const [adding, setAdding] = useState<Record<string, boolean>>({});
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [addingAll, setAddingAll] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const addOne = useCallback(async (item: string) => {
    setAdding((s) => ({ ...s, [item]: true }));
    setMessage(null);

    try {
      const res = await fetch('/api/shopping-list-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: item }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to add');

      setAdded((s) => ({ ...s, [item]: true }));
      setMessage(`Added "${item}" to your shopping list.`);
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message ?? 'Failed to add item');
    } finally {
      setAdding((s) => ({ ...s, [item]: false }));
    }
  }, []);

  const addAll = useCallback(async () => {
    const itemsToAdd = missingItems.filter((i) => !added[i]);

    if (!itemsToAdd.length) {
      setMessage('All missing items are already added.');
      return;
    }

    setAddingAll(true);
    setMessage(null);

    try {
      const res = await fetch('/api/shopping-list-item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsToAdd }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to add');

      const createdNames = (data.created ?? []).map((c: any) => c.name as string);
      const updates: Record<string, boolean> = {};

      createdNames.forEach((n: any) => (updates[n] = true));

      setAdded((s) => ({ ...s, ...updates }));
      setMessage(`Added ${createdNames.length} item(s) to your shopping list.`);
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message ?? 'Failed to add items');
    } finally {
      setAddingAll(false);
    }
  }, [missingItems, added]);

  const renderButtonLabel = (item: string) => {
    if (adding[item]) return <Spinner animation="border" size="sm" />;
    if (added[item]) return 'Added ✓';
    return `Add ${item}`;
  };

  if (!missingItems?.length) return null;

  return (
    <div className="mt-3">
      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
        <Button
          variant="outline-success"
          onClick={addAll}
          disabled={addingAll}
          title="Add every missing ingredient to your shopping list"
        >
          {addingAll ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Adding...
            </>
          ) : (
            'Add all missing items'
          )}
        </Button>

        <small className="text-muted">or add items individually:</small>
      </div>

      <div className="d-flex flex-wrap gap-2">
        {missingItems.map((item) => (
          <div key={item} className="d-flex align-items-center gap-2">
            <Button
              size="sm"
              variant={added[item] ? 'success' : 'outline-primary'}
              onClick={() => addOne(item)}
              disabled={adding[item] || !!added[item]}
              title={added[item] ? 'Already added' : `Add ${item} to shopping list`}
            >
              {renderButtonLabel(item)}
            </Button>
          </div>
        ))}
      </div>

      {message && (
        <div className="mt-2">
          <small className="text-muted">{message}</small>
        </div>
      )}
    </div>
  );
}

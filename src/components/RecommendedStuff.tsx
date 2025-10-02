'use client';

import { Badge, Button, Card } from 'react-bootstrap';

type Item = {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  expiration: Date | string | null;
};

export default function RecommendedStuff({
  items,
  canAdd,
  onAdd,
  lowQtyThreshold,
  expiringWithinDays,
}: {
  items: Item[];
  canAdd: boolean;
  onAdd: (produceId: number) => void | Promise<void>;
  lowQtyThreshold: number;
  expiringWithinDays: number;
}) {
  if (!items.length) return null;

  const toDate = (v: Date | string | null): Date | null => {
    if (!v) return null;
    const d = typeof v === 'string' ? new Date(v) : v;
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const isSoon = (exp: Date | string | null) => {
    const d = toDate(exp);
    if (!d) return false;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + expiringWithinDays);
    return d <= cutoff;
  };

  const fmtDate = (v: Date | string | null) => {
    const d = toDate(v);
    return d ? d.toLocaleDateString() : '';
  };

  return (
    <section className="my-4">
      <h2 className="h4 mb-3">Recommended to add</h2>

      {/* stack cards vertically full width of the sidebar column */}
      <div className="d-flex flex-column gap-3">
        {items.map((it) => {
          const low = it.quantity <= lowQtyThreshold;
          const soon = isSoon(it.expiration);

          return (
            <Card key={it.id} className="w-100">
              <Card.Body>
                <Card.Title className="d-flex items-center justify-content-between gap-2">
                  <span className="text-truncate">{it.name}</span>
                  <span className="d-flex gap-1">
                    {low && <Badge bg="warning" text="dark">Low</Badge>}
                    {soon && <Badge bg="danger">Expiring</Badge>}
                  </span>
                </Card.Title>

                <Card.Text className="mb-2">
                  Qty:
                  {' '}
                  {it.quantity}
                  {' '}
                  {it.unit || ''}
                  {it.expiration && (
                    <>
                      <br />
                      Exp:
                      {' '}
                      {fmtDate(it.expiration)}
                    </>
                  )}
                </Card.Text>

                <div className="d-flex justify-content-end">
                  {canAdd ? (
                    <form action={onAdd.bind(null, it.id)}>
                      <Button size="sm" variant="primary" type="submit">
                        Add
                      </Button>
                    </form>
                  ) : (
                    <Button size="sm" variant="secondary" disabled>
                      Add
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

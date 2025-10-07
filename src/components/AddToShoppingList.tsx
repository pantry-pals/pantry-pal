'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button, Form, InputGroup, Spinner, Alert, Card } from 'react-bootstrap';

type ProduceLite = { id: number; name: string };
type ListLite = { id: number; name: string };

export default function AddToShoppingList() {
  const [showForm, setShowForm] = useState(false);

  // Suggestions data
  const [produceList, setProduceList] = useState<ProduceLite[]>([]);
  const [lists, setLists] = useState<ListLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  // Form fields
  const [nameInput, setNameInput] = useState('');
  const [matchedProduceId, setMatchedProduceId] = useState<number | null>(null);

  const [listInput, setListInput] = useState('');
  const [matchedListId, setMatchedListId] = useState<number | null>(null);

  const [quantity, setQuantity] = useState<number>(1);
  const [price, setPrice] = useState<string>('');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const dlProduce = 'dl-produce';
  const dlLists = 'dl-lists';

  // load suggestions when form opens
  useEffect(() => {
    if (!showForm) return;
    (async () => {
      setLoading(true);
      setLoadErr(null);
      try {
        const [pRes, lRes] = await Promise.all([
          fetch('/api/produce', { cache: 'no-store' }),
          fetch('/api/shopping-lists', { cache: 'no-store' }),
        ]);
        if (!pRes.ok) throw new Error(`Produce load failed (${pRes.status})`);
        if (!lRes.ok) throw new Error(`Lists load failed (${lRes.status})`);
        const pData: ProduceLite[] = await pRes.json();
        const lData: ListLite[] = await lRes.json();
        pData.sort((a, b) => a.name.localeCompare(b.name));
        lData.sort((a, b) => a.name.localeCompare(b.name));
        setProduceList(pData);
        setLists(lData);
      } catch (e: any) {
        setLoadErr(e?.message ?? 'Failed to load suggestions.');
      } finally {
        setLoading(false);
      }
    })();
  }, [showForm]);

  // suggestion filtering (cap to 12 for UX)
  const prodSuggestions = useMemo(() => {
    const q = nameInput.trim().toLowerCase();
    if (!q) return produceList.slice(0, 12);
    return produceList.filter(p => p.name.toLowerCase().includes(q)).slice(0, 12);
  }, [nameInput, produceList]);

  const listSuggestions = useMemo(() => {
    const q = listInput.trim().toLowerCase();
    if (!q) return lists.slice(0, 12);
    return lists.filter(l => l.name.toLowerCase().includes(q)).slice(0, 12);
  }, [listInput, lists]);

  // sync exact match ids
  const syncProduce = (val: string) => {
    setNameInput(val);
    const exact = produceList.find(p => p.name.toLowerCase() === val.trim().toLowerCase());
    setMatchedProduceId(exact ? exact.id : null);
  };
  const syncList = (val: string) => {
    setListInput(val);
    const exact = lists.find(l => l.name.toLowerCase() === val.trim().toLowerCase());
    setMatchedListId(exact ? exact.id : null);
  };

  const toggle = () => {
    setShowForm(!showForm);
    setErr(null);
    setOk(null);
  };

  const reset = () => {
    setNameInput('');
    setMatchedProduceId(null);
    setListInput('');
    setMatchedListId(null);
    setQuantity(1);
    setPrice('');
    setNotes('');
    setErr(null);
    setOk(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOk(null);

    const prod = nameInput.trim();
    const list = listInput.trim();
    if (!prod) return setErr('Please enter a produce name.');
    if (!list) return setErr('Please enter a shopping list name.');

    const payload = {
      // produce
      produceId: matchedProduceId ?? undefined,
      newProduceName: matchedProduceId ? undefined : prod,
      // target list
      listId: matchedListId ?? undefined,
      newListName: matchedListId ? undefined : list,
      // details
      quantity,
      price: price.trim() ? Number(price) : null,
      notes: notes.trim() || null,
    };

    setSaving(true);
    try {
      const res = await fetch('/api/shopping-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? `Request failed (${res.status})`);
      }
      setOk('Added to list!');
      setSaving(false);
      setTimeout(() => {
        reset();
        setShowForm(false);
      }, 800);
    } catch (e: any) {
      setSaving(false);
      setErr(e?.message ?? 'Something went wrong.');
    }
  };

  return (
    <div>
      <Button variant="primary" onClick={toggle}>
        {showForm ? 'Cancel' : 'Add to Shopping List'}
      </Button>

      {showForm && (
        <Card className="mt-3 shadow-sm">
          <Card.Body>
            <Form onSubmit={submit}>
              <Card.Title>Add Item</Card.Title>

              {loadErr && <Alert variant="danger">{loadErr}</Alert>}
              {err && <Alert variant="danger">{err}</Alert>}
              {ok && <Alert variant="success">{ok}</Alert>}

              {loading ? (
                <div className="d-flex align-items-center gap-2">
                  <Spinner size="sm" /> <span>Loading…</span>
                </div>
              ) : (
                <>
                  {/* Produce name with suggestions */}
                  <Form.Group className="mb-3" controlId="produceName">
                    <Form.Label>Produce</Form.Label>
                    <Form.Control
                      type="text"
                      value={nameInput}
                      onChange={(e) => syncProduce(e.target.value)}
                      placeholder="Start typing… e.g., Banana"
                      list={dlProduce}
                      autoComplete="off"
                      required
                    />
                    <datalist id={dlProduce}>
                      {prodSuggestions.map(p => (
                        <option key={p.id} value={p.name} />
                      ))}
                    </datalist>
                    <Form.Text className="text-muted">
                      {matchedProduceId ? 'Matched existing pantry item.' : nameInput ? 'Will create a new item.' : 'Pick a suggestion or type a new item.'}
                    </Form.Text>
                  </Form.Group>

                  {/* Target shopping list with suggestions */}
                  <Form.Group className="mb-3" controlId="listName">
                    <Form.Label>Shopping list</Form.Label>
                    <Form.Control
                      type="text"
                      value={listInput}
                      onChange={(e) => syncList(e.target.value)}
                      placeholder={`e.g., Weekday Groceries or Saturday's Party`}
                      list={dlLists}
                      autoComplete="off"
                      required
                    />
                    <datalist id={dlLists}>
                      {listSuggestions.map(l => (
                        <option key={l.id} value={l.name} />
                      ))}
                    </datalist>
                    <Form.Text className="text-muted">
                      {matchedListId ? 'Adding to existing list.' : listInput ? 'New list will be created.' : 'Pick a list or type a new one.'}
                    </Form.Text>
                  </Form.Group>

                  {/* Quantity */}
                  <Form.Group className="mb-3" controlId="quantity">
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      step={1}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value || '1', 10))}
                      required
                    />
                  </Form.Group>

                  {/* Price */}
                  <Form.Group className="mb-3" controlId="price">
                    <Form.Label>Target price (optional)</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>$</InputGroup.Text>
                      <Form.Control
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step="0.01"
                        placeholder="e.g., 3.99"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>

                  {/* Notes */}
                  <Form.Group className="mb-3" controlId="notes">
                    <Form.Label>Notes (optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Brand, size, store, etc."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end">
                    <Button type="submit" variant="success" disabled={saving}>
                      {saving ? (<><Spinner size="sm" className="me-2" />Saving…</>) : 'Add to list'}
                    </Button>
                  </div>
                </>
              )}
            </Form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

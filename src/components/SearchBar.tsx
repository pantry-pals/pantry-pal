'use client';

import React, { useMemo, useState } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { Produce } from '@prisma/client';
import ProduceItem from './ProduceItem';

type Props = { initialProduce: Produce[] };

// order the “known” sections first; everything else appears after, alphabetically
const LOCATION_ORDER = ['Freezer', 'Fridge', 'Pantry'] as const;

// safely get a timestamp; put null/invalid dates at the end (Infinity)
const toTime = (d: unknown): number => {
  if (!d) return Number.POSITIVE_INFINITY;
  const t = new Date(d as string | number | Date).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
};

// --- helper components (kept in this file to avoid eslint on nested ternaries) ---
function FlatTable({ rows }: { rows: Produce[] }) {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Location</th>
          <th>Quantity</th>
          <th>Expiration</th>
          <th>Edit</th>
        </tr>
      </thead>
      <tbody>
        {rows.length ? (
          rows.map((p) => <ProduceItem key={p.id} {...p} />)
        ) : (
          <tr>
            <td colSpan={6} className="text-center">No items found</td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

function capitalizeFirst(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function GroupedSections({ groups }: { groups: Array<[string, Produce[]]> }) {
  if (groups.length === 0) {
    return <div className="text-center">No items found</div>;
  }
  return (
    <>
      {groups.map(([loc, items]) => (
        <Container key={loc} className="mb-4">
          <h3 className="mt-2">{capitalizeFirst(loc) || 'Unknown'}</h3>
          <Table striped bordered hover className="mt-2" style={{ tableLayout: 'fixed', width: '100%' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Location</th>
                <th>Quantity</th>
                <th>Expiration</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => <ProduceItem key={p.id} {...p} />)}
            </tbody>
          </Table>
        </Container>
      ))}
    </>
  );
}

// --- main component ---
const ProduceListWithGrouping: React.FC<Props> = ({ initialProduce }) => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<
  '' | 'name-asc' | 'name-desc' | 'location-asc' | 'type-asc' | 'expiration-soon' | 'qty-desc'
  >('');
  const [groupByLocation, setGroupByLocation] = useState(false); // default = flat list

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = [...initialProduce];

    if (q) {
      arr = arr.filter((p) => p.name.toLowerCase().includes(q)
        || (p.type?.toLowerCase().includes(q) ?? false)
        || (p.location?.toLowerCase().includes(q) ?? false));
    }

    switch (sort) {
      case 'name-asc': arr.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name-desc': arr.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'location-asc': arr.sort((a, b) => (a.location ?? '').localeCompare(b.location ?? '')); break;
      case 'type-asc': arr.sort((a, b) => (a.type ?? '').localeCompare(b.type ?? '')); break;
      case 'expiration-soon':
        arr.sort((a, b) => toTime(a.expiration) - toTime(b.expiration));
        break;

      case 'qty-desc': arr.sort((a, b) => Number(b.quantity ?? 0) - Number(a.quantity ?? 0)); break;
      default: break;
    }

    return arr;
  }, [initialProduce, search, sort]);

  const grouped = useMemo(() => {
    if (!groupByLocation) return [] as Array<[string, Produce[]]>;

    const map = new Map<string, Produce[]>();
    for (const item of filteredSorted) {
      const key = item.location?.trim() || 'Unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }

    const sortInside = (list: Produce[]) => {
      const arr = [...list];
      // reuse the current sort inside each section (except location-asc which doesn’t matter inside a single location)
      switch (sort) {
        case 'name-asc': arr.sort((a, b) => a.name.localeCompare(b.name)); break;
        case 'name-desc': arr.sort((a, b) => b.name.localeCompare(a.name)); break;
        case 'type-asc': arr.sort((a, b) => (a.type ?? '').localeCompare(b.type ?? '')); break;
        case 'expiration-soon':
          arr.sort((a, b) => toTime(a.expiration) - toTime(b.expiration));
          break;
        case 'qty-desc': arr.sort((a, b) => Number(b.quantity ?? 0) - Number(a.quantity ?? 0)); break;
        default: break;
      }
      return arr;
    };

    const sections: Array<[string, Produce[]]> = [];

    // preferred order first
    for (const loc of LOCATION_ORDER) {
      if (map.has(loc)) { sections.push([loc, sortInside(map.get(loc)!)]); map.delete(loc); }
    }

    // then any other locations alphabetically
    for (const [loc, items] of Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))) {
      sections.push([loc, sortInside(items)]);
    }

    return sections;
  }, [filteredSorted, groupByLocation, sort]);

  const clear = () => { setSearch(''); setSort(''); };

  return (
    <>
      {/* controls */}
      <Container className="my-4">
        <Row className="justify-content-center align-items-center g-2">
          <Col xs={12} md={5}>
            <Form.Control
              type="text"
              placeholder="Search by name, type, or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
            />
          </Col>

          <Col xs={12} md="auto">
            <Form.Select value={sort} onChange={(e) => setSort(e.target.value as any)}>
              <option value="">Sort by…</option>
              <option value="name-asc">Name (A–Z)</option>
              <option value="name-desc">Name (Z–A)</option>
              <option value="location-asc">Location (A–Z)</option>
              <option value="type-asc">Type (A–Z)</option>
              <option value="expiration-soon">Expiration (Soonest)</option>
              <option value="qty-desc">Quantity (High → Low)</option>
            </Form.Select>
          </Col>

          <Col xs="auto" className="d-flex align-items-center gap-2">
            <Form.Check
              type="switch"
              id="group-by-location"
              label="Group by location"
              checked={groupByLocation}
              onChange={(e) => setGroupByLocation(e.currentTarget.checked)}
            />
            <Button variant="secondary" onClick={clear}>Clear</Button>
          </Col>
        </Row>
      </Container>

      {/* render */}
      {groupByLocation ? (
        <GroupedSections groups={grouped} />
      ) : (
        <FlatTable rows={filteredSorted} />
      )}
    </>
  );
};

export default ProduceListWithGrouping;

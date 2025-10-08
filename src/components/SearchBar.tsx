'use client';

/* eslint-disable operator-linebreak, @typescript-eslint/indent, implicit-arrow-linebreak */

import React, { useMemo, useState } from 'react';
import { Container, Row, Col, Form, Button, Table, ButtonGroup } from 'react-bootstrap';
import { Produce } from '@prisma/client';
import { BsList, BsGrid } from 'react-icons/bs';
import ProduceItem from './ProduceItem';
import ProduceCard from './ProduceCard';

type Props = { initialProduce: Produce[] };

const LOCATION_ORDER = ['freezer', 'fridge', 'pantry'] as const;
type ViewMode = 'table' | 'cards';

const toTime = (d: unknown): number => {
  if (!d) return Number.POSITIVE_INFINITY;
  const t = new Date(d as string | number | Date).getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
};

// Table component
function FlatTable({ rows }: { rows: Produce[] }) {
  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Location</th>
          <th>Quantity</th>
          <th>Restock Threshold</th>
          <th>Expiration</th>
          <th>Edit</th>
        </tr>
      </thead>
      <tbody>
        {rows.length ? (
          rows.map((p) => <ProduceItem key={p.id} {...p} restockThreshold={p.restockThreshold ?? 1} />)
        ) : (
          <tr>
            <td colSpan={6} className="text-center">
              No items found
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

// Card grid component
function CardGrid({ rows }: { rows: Produce[] }) {
  if (!rows.length) return <div className="text-center">No items found</div>;
  return (
    <Row xs={1} sm={2} md={3} lg={4} className="g-3">
      {rows.map((p) => (
        <Col key={p.id}>
          <ProduceCard produce={p} />
        </Col>
      ))}
    </Row>
  );
}

function capitalizeFirst(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Reuse FlatTable inside each section (no duplicate table markup)
function GroupedTableSections({ groups }: { groups: Array<[string, Produce[]]> }) {
  if (groups.length === 0) return <div className="text-center">No items found</div>;
  return (
    <>
      {groups.map(([loc, items]) => (
        <Container key={loc} className="mb-4">
          <h3 className="mt-2">{capitalizeFirst(loc) || 'Unknown'}</h3>
          <FlatTable rows={items} />
        </Container>
      ))}
    </>
  );
}

function GroupedCardSections({ groups }: { groups: Array<[string, Produce[]]> }) {
  if (groups.length === 0) return <div className="text-center">No items found</div>;
  return (
    <>
      {groups.map(([loc, items]) => (
        <Container key={loc} className="mb-4">
          <h3 className="mt-2">{capitalizeFirst(loc) || 'Unknown'}</h3>
          <CardGrid rows={items} />
        </Container>
      ))}
    </>
  );
}

// Main Search Bar component with grouping and view toggle
const ProduceListWithGrouping: React.FC<Props> = ({ initialProduce }) => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<
    '' | 'name-asc' | 'location-asc' | 'type-asc' | 'expiration-soon' | 'qty-desc' | 'qty-asc'
  >('');
  const [groupByLocation, setGroupByLocation] = useState(false);
  const [view, setView] = useState<ViewMode>('table');

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    let arr = [...initialProduce];

    if (q) {
      arr = arr.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.type?.toLowerCase().includes(q) ?? false) ||
          (p.location?.toLowerCase().includes(q) ?? false),
      );
    }

    switch (sort) {
      case 'name-asc':
        arr.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'location-asc':
        arr.sort((a, b) => (a.location ?? '').localeCompare(b.location ?? ''));
        break;
      case 'type-asc':
        arr.sort((a, b) => (a.type ?? '').localeCompare(b.type ?? ''));
        break;
      case 'expiration-soon':
        arr.sort((a, b) => toTime(a.expiration) - toTime(b.expiration));
        break;
      case 'qty-desc':
        arr.sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0));
        break;
      case 'qty-asc':
        arr.sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
        break;
      default:
        break;
    }

    return arr;
  }, [initialProduce, search, sort]);

  const grouped = useMemo(() => {
    if (!groupByLocation) return [] as Array<[string, Produce[]]>;
    const map = new Map<string, Produce[]>();

    for (const item of filteredSorted) {
      const key = item.location?.trim().toLowerCase() || 'unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }

    const sortInside = (list: Produce[]) => {
      const arr = [...list];
      switch (sort) {
        case 'name-asc':
          arr.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'type-asc':
          arr.sort((a, b) => (a.type ?? '').localeCompare(b.type ?? ''));
          break;
        case 'expiration-soon':
          arr.sort((a, b) => toTime(a.expiration) - toTime(b.expiration));
          break;
        case 'qty-desc':
          arr.sort((a, b) => (b.quantity ?? 0) - (a.quantity ?? 0));
          break;
        case 'qty-asc':
          arr.sort((a, b) => (a.quantity ?? 0) - (b.quantity ?? 0));
          break;
        default:
          break;
      }
      return arr;
    };

    const sections: Array<[string, Produce[]]> = [];
    for (const loc of LOCATION_ORDER) {
      if (map.has(loc)) {
        sections.push([loc, sortInside(map.get(loc)!)]);
        map.delete(loc);
      }
    }
    for (const [loc, items] of Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))) {
      sections.push([loc, sortInside(items)]);
    }
    return sections;
  }, [filteredSorted, groupByLocation, sort]);

  const clear = () => {
    setSearch('');
    setSort('');
  };

  return (
    <>
      {/* controls */}
      <Container className="my-4">
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-center">
          <Form.Control
            type="text"
            placeholder="Search by name, type, or location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
            style={{ maxWidth: '280px' }}
          />

          <Form.Select value={sort} onChange={(e) => setSort(e.target.value as any)} style={{ maxWidth: '180px' }}>
            <option value="">Sort by…</option>
            <option value="name-asc">Name (A–Z)</option>
            <option value="location-asc">Location (A–Z)</option>
            <option value="type-asc">Type (A–Z)</option>
            <option value="expiration-soon">Expiration (Soonest)</option>
            <option value="qty-desc">Quantity (High → Low)</option>
            <option value="qty-asc">Quantity (Low → High)</option>
          </Form.Select>

          <Form.Check
            type="switch"
            id="group-by-location"
            label="Group by location"
            checked={groupByLocation}
            onChange={(e) => setGroupByLocation(e.currentTarget.checked)}
          />

          <ButtonGroup aria-label="View mode">
            <Button
              variant={view === 'table' ? 'primary' : 'outline-primary'}
              onClick={() => setView('table')}
              title="Table View"
            >
              <BsList size={20} />
            </Button>
            <Button
              variant={view === 'cards' ? 'primary' : 'outline-primary'}
              onClick={() => setView('cards')}
              title="Card View"
            >
              <BsGrid size={20} />
            </Button>
          </ButtonGroup>

          <Button variant="secondary" onClick={clear}>
            Clear
          </Button>
        </div>
      </Container>

      {/* render */}
      {(() => {
        if (groupByLocation) {
          if (view === 'table') {
            return <GroupedTableSections groups={grouped} />;
          }
          return <GroupedCardSections groups={grouped} />;
        }
        if (view === 'table') {
          return <FlatTable rows={filteredSorted} />;
        }
        return <CardGrid rows={filteredSorted} />;
      })()}
    </>
  );
};

export default ProduceListWithGrouping;

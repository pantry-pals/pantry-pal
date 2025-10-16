'use client';

import React from 'react';
import { Container } from 'react-bootstrap';
import { Produce } from '@prisma/client';
import ProduceTable from './ProduceTable';
import ProduceCardGrid from './ProduceCardGrid';

function capitalizeFirst(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

type Props = {
  groups: Array<[string, Produce[]]>;
  view: 'table' | 'cards';
};

const GroupedSections: React.FC<Props> = ({ groups, view }) => {
  if (groups.length === 0) return <div className="text-center">No items found</div>;

  return (
    <>
      {groups.map(([storage, items]) => (
        <Container key={storage} className="mb-4">
          <h3 className="mt-2">{capitalizeFirst(storage) || 'Unknown'}</h3>
          {view === 'table' ? <ProduceTable rows={items} /> : <ProduceCardGrid rows={items} />}
        </Container>
      ))}
    </>
  );
};

export default GroupedSections;

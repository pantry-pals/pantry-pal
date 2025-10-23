'use client';

import { Table } from 'react-bootstrap';
import { Produce } from '@prisma/client';
import { useEffect, useState } from 'react';
import ProduceItem from './ProduceItem';

const ProduceTable = ({ rows }: { rows: Produce[] }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <Table
        striped
        bordered
        hover
        style={{
          textAlign: 'center',
          tableLayout: isMobile ? 'auto' : 'fixed',
          width: '100%',
          verticalAlign: 'middle',
        }}
      >
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Storage</th>
            <th>Quantity</th>
            <th>Restock</th>
            <th>Expiration</th>
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((p) => (
              <ProduceItem key={p.id} {...p} restockThreshold={p.restockThreshold ?? 1} />
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center">
                No items found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default ProduceTable;

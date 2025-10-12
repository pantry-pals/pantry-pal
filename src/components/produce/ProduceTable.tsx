'use client';

import { Table } from 'react-bootstrap';
import { Produce } from '@prisma/client';
import ProduceItem from '../ProduceItem';

const ProduceTable = ({ rows }: { rows: Produce[] }) => (
  <Table striped bordered hover>
    <thead>
      <tr>
        <th>Name</th>
        <th>Type</th>
        <th>Storage</th>
        <th>Quantity</th>
        <th>Restock Threshold</th>
        <th>Expiration</th>
        <th>Edit</th>
      </tr>
    </thead>
    <tbody>
      {rows.length ? (
        rows.map((p) => (
          <ProduceItem key={p.id} {...p} restockThreshold={p.restockThreshold ?? 1} />
        ))
      ) : (
        <tr>
          <td colSpan={7} className="text-center">
            No items found
          </td>
        </tr>
      )}
    </tbody>
  </Table>
);

export default ProduceTable;

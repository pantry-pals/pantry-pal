'use client';

import { Row, Col } from 'react-bootstrap';
import { Produce } from '@prisma/client';
import ProduceCard from './ProduceCard';

const ProduceCardGrid = ({ rows }: { rows: Produce[] }) => {
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
};

export default ProduceCardGrid;

'use client';

import { Card, ListGroup, Image } from 'react-bootstrap/';
import Link from 'next/link';
import type { Produce } from '@prisma/client';

type Props = { produce: Produce };

const formatDate = (d?: Date | string | null) => {
  if (!d) return 'Not Available';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return 'Not Available';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function ProduceCard({ produce }: Props) {
  const imageSrc = produce.image || '/no-image.png'; // default image if none provided

  return (
    <Card className="h-100 mb-3 image-shadow">
      <Card.Header>
        <Link href={`/produce/${produce.id}`} className="link-dark">
          <Card.Title className="mb-1">{produce.name}</Card.Title>
        </Link>
        <Card.Subtitle className="text-muted">
          {produce.type || 'Type Not Available'}
        </Card.Subtitle>
      </Card.Header>

      <Card.Body>
        <Image
          src={imageSrc}
          alt={produce.name || 'No image'}
          height="200px"
          width="100%"
          className="mb-2 image-shadow"
          style={{ objectFit: 'cover' }}
        />

        <ListGroup variant="flush">
          <ListGroup.Item>
            <strong>Located At:</strong>
            {' '}
            {produce.location || 'Not Available'}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Quantity:</strong>
            {' '}
            {typeof produce.quantity === 'number' ? produce.quantity : 'Not Available'}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Expiration:</strong>
            {' '}
            {formatDate(produce.expiration)}
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );
}

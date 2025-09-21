import { Produce } from '@prisma/client';
import Link from 'next/link';

interface ProduceWithProduct extends Produce {
  product: {
    name: string;
    type: string | null;
  } | null;
}

const ProduceItem = ({ id, product, location, quantity, expiration }: ProduceWithProduct) => (
  <tr>
    <td>{product?.name || 'Unknown'}</td>
    <td>{product?.type || 'N/A'}</td>
    <td>{location}</td>
    <td>{quantity}</td>
    <td>{expiration ? new Date(expiration).toLocaleDateString() : 'N/A'}</td>
    <td>
      <Link href={`/edit/${id}`}>Edit</Link>
    </td>
  </tr>
);

export default ProduceItem;

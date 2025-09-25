import { Produce } from '@prisma/client';
import Link from 'next/link';

const ProduceItem = ({ id, name, quantity, unit, type, location, expiration }: Produce) => (
  <tr>
    <td>{name}</td>
    <td>{type}</td>
    <td>{location}</td>
    <td>
      {quantity.toString()}
      {unit ? ` ${unit}` : ''}
    </td>
    <td>{expiration ? new Date(expiration).toLocaleDateString() : 'N/A'}</td>
    <td>
      <Link href={`/edit/${id}`}>Edit</Link>
    </td>
  </tr>
);

export default ProduceItem;

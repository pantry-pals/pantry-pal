import { Produce } from '@prisma/client';
import Link from 'next/link';

/* Renders a single row in the List Stuff table. See list/page.tsx. */
const StuffItem = ({ name, type, location, quantity, expiration }: Produce) => (
  <tr>
    <td>{name}</td>
    <td>{type}</td>
    <td>{location}</td>
    <td>{quantity}</td>
    <td>{expiration}</td>
    <td>
      <Link href={`/edit/${id}`}>Edit</Link>
    </td>
  </tr>
);

export default StuffItem;

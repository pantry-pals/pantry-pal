import { Stuff } from '@prisma/client';
import Link from 'next/link';

const StuffItem = ({ id, name, quantity, condition }: Stuff) => (
  <tr>
    <td>{name}</td>
    <td>{quantity}</td>
    <td>{condition}</td>
    <td>
      <Link href={`/edit/${id}`}>Edit</Link>
    </td>
  </tr>
);

export default StuffItem;

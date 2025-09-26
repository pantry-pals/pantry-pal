import { Produce } from '@prisma/client';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import EditProduceModal from './EditProduceModal';
import '../styles/buttons.css';

const ProduceItem = ({ id, name, quantity, unit, type, location, expiration, owner, image }: Produce) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <tr>
        <td>{name}</td>
        <td>{type}</td>
        <td>{location}</td>
        <td>
          {quantity.toString()}
          {unit ? ` ${unit}` : ''}
        </td>
        <td>
          {expiration ? new Date(expiration).toISOString().split('T')[0] : 'N/A'}
        </td>
        <td>
          <Button className="btn-edit" onClick={() => setShowModal(true)}>
            Edit
          </Button>
        </td>
      </tr>

      {/* Modal component for editing produce item */}
      <EditProduceModal
        show={showModal}
        onHide={() => setShowModal(false)}
        produce={{ id, name, quantity, unit, type, location, expiration, owner, image }}
      />
    </>
  );
};

export default ProduceItem;

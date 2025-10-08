import { Produce } from '@prisma/client';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import EditProduceModal from './EditProduceModal';
import '../styles/buttons.css';

/* eslint-disable react/require-default-props */
const ProduceItem = ({
  id,
  name,
  quantity,
  unit,
  type,
  location,
  expiration,
  owner,
  image,
  restockThreshold = 1,
}: Produce & { restockThreshold?: number }) => {
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
        <td>{restockThreshold !== undefined ? restockThreshold : 'N/A'}</td>
        <td>{expiration ? new Date(expiration).toISOString().split('T')[0] : 'N/A'}</td>
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
        produce={{
          id,
          name,
          quantity,
          unit,
          type,
          location,
          expiration,
          owner,
          image,
          restockThreshold,
        }}
      />
    </>
  );
};

export default ProduceItem;

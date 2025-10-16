import { Produce } from '@prisma/client';
import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Trash } from 'react-bootstrap-icons';
import EditProduceModal from './EditProduceModal';
import '../styles/buttons.css';
import DeleteProduceModal from './DeleteProduceModal';

/* eslint-disable react/require-default-props */
const ProduceItem = ({
  id,
  name,
  quantity,
  unit,
  type,
  location,
  storage,
  expiration,
  owner,
  image,
  restockThreshold = 1,
}: Produce & { restockThreshold?: number }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const safeRestock = restockThreshold ?? 1;

  return (
    <>
      <tr>
        <td>{name}</td>
        <td>{type}</td>
        <td>
          {storage}
          {' '}
          at
          {' '}
          {location}
        </td>
        <td>
          {quantity.toString()}
          {unit ? ` ${unit}` : ''}
        </td>
        <td>{safeRestock}</td>
        <td>{expiration ? new Date(expiration).toISOString().split('T')[0] : 'N/A'}</td>
        <td>
          <Button className="btn-edit" onClick={() => setShowEditModal(true)}>
            Edit
          </Button>
        </td>
        <td>
          <Button variant="danger" className="btn-delete" onClick={() => setShowDeleteModal(true)}>
            <Trash color="white" size={18} />
          </Button>
        </td>
      </tr>

      {/* Modal component for editing produce item */}
      <EditProduceModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        produce={{
          id,
          name,
          quantity,
          unit,
          type,
          location,
          storage,
          expiration,
          owner,
          image,
          restockThreshold: safeRestock,
        }}
      />

      {/* Modal component for deleting produce item */}
      <DeleteProduceModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        produce={{
          id,
          name,
          quantity,
          unit,
          type,
          location,
          storage,
          expiration,
          owner,
          image,
          restockThreshold: safeRestock,
        }}
      />
    </>
  );
};

export default ProduceItem;

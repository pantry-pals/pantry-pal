'use client';

import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { yupResolver } from '@hookform/resolvers/yup';
import { Produce } from '@prisma/client';
import { AddProduceSchema } from '@/lib/validationSchemas';
import { addProduce } from '@/lib/dbActions';
import { InferType } from 'yup';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import '../../styles/buttons.css';

type ProduceValues = InferType<typeof AddProduceSchema>;

interface AddProduceModalProps {
  show: boolean;
  onHide: () => void;
  produce: Produce;
}

const AddProduceModal = ({ show, onHide, produce }: AddProduceModalProps) => {
  // Available unit options
  const unitOptions = useMemo(() => ['kg', 'g', 'lb', 'oz', 'pcs', 'ml', 'l', 'Other'], []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProduceValues>({
    resolver: yupResolver(AddProduceSchema),
    defaultValues: {
      unit: unitOptions[0],
    },
  });

  const router = useRouter();

  // Track dropdown state
  const [unitChoice, setUnitChoice] = useState(unitOptions[0]);

  // Reset form values every time modal closes or produce changes
  useEffect(() => {
    if (!show) {
      reset();
    }
  }, [show, reset]);

  const handleClose = () => {
    reset();
    onHide();
  };

  const onSubmit = async (data: ProduceValues) => {
    console.log('Submitting new produce item');
    await addProduce({
      ...data,
      expiration: data.expiration ?? null,
      image: data.image ? data.image : null,
      restockThreshold: Number(data.restockThreshold ?? 0),
    });
    swal('Success', 'Your item has been added', 'success', {
      timer: 2000,
    });

    handleClose();
    router.refresh();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="justify-content-center">
        <Modal.Title>Add Pantry Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Row className="mb-3">
            <Col xs={6} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0">Name</Form.Label>
                <Form.Control
                  type="text"
                  {...register('name')}
                  required
                  className={`${errors.name ? 'is-invalid' : ''}`}
                  placeholder="e.g., Chicken"
                />
                <div className="invalid-feedback">{errors.name?.message}</div>
              </Form.Group>
            </Col>
            <Col xs={6} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0">Type</Form.Label>
                <Form.Control
                  type="text"
                  {...register('type')}
                  className={`${errors.type ? 'is-invalid' : ''}`}
                  placeholder="e.g., Meat"
                />
                <div className="invalid-feedback">{errors.type?.message}</div>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col xs={6} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0">Location</Form.Label>
                <Form.Control
                  type="text"
                  {...register('location')}
                  className={`${errors.location ? 'is-invalid' : ''}`}
                  placeholder="e.g., House, Work"
                />
                <div className="invalid-feedback">{errors.location?.message}</div>
              </Form.Group>
            </Col>
            <Col xs={6} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0">Storage</Form.Label>
                <Form.Control
                  type="text"
                  {...register('storage')}
                  className={`${errors.storage ? 'is-invalid' : ''}`}
                  placeholder="e.g., Freezer"
                />
                <div className="invalid-feedback">{errors.storage?.message}</div>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xs={6} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0">Quantity</Form.Label>
                <Form.Control
                  type="number"
                  {...register('quantity')}
                  step={0.5}
                  placeholder="eg., 1, 1.5"
                  className={`${errors.quantity ? 'is-invalid' : ''}`}
                />
                <div className="invalid-feedback">{errors.quantity?.message}</div>
              </Form.Group>
            </Col>
            <Col xs={6} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0">Unit</Form.Label>
                <Form.Select
                  defaultValue={unitOptions[0]}
                  className={`${errors.unit ? 'is-invalid' : ''}`}
                  onChange={(e) => {
                    const { value } = e.target;
                    setUnitChoice(value);
                    if (value !== 'Other') {
                      setValue('unit', value); // preset
                    } else {
                      setValue('unit', ''); // clear for custom typing
                    }
                  }}
                >
                  {unitOptions.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </Form.Select>

                {unitChoice === 'Other' && (
                  <Form.Control
                    type="text"
                    {...register('unit')}
                    placeholder="Enter custom unit"
                    className={`mt-2 ${errors.unit ? 'is-invalid' : ''}`}
                  />
                )}
                <div className="invalid-feedback">{errors.unit?.message}</div>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xs={6} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0">Expiration Date</Form.Label>
                <Form.Control
                  type="date"
                  {...register('expiration')}
                  className={`${errors.expiration ? 'is-invalid' : ''}`}
                />
                <div className="invalid-feedback">{errors.expiration?.message}</div>
              </Form.Group>
            </Col>
            <Col xs={6} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0">Image</Form.Label>
                <Form.Control
                  type="text"
                  {...register('image')}
                  className={`${errors.image ? 'is-invalid' : ''}`}
                  placeholder="Image URL"
                />
                <div className="invalid-feedback">{errors.image?.message}</div>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col xs={12} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0">
                  Restock Threshold
                </Form.Label>

                <div className="d-flex justify-content-center mb-2">
                  <Form.Control
                    type="number"
                    step={0.5}
                    {...register('restockThreshold')}
                    placeholder="e.g., 0.5"
                    className={`${errors.restockThreshold ? 'is-invalid' : ''}`}
                    style={{ width: '100px' }}
                  />
                </div>

                <Form.Text
                  className="text-muted d-block mx-auto"
                  style={{
                    maxWidth: '320px',
                    fontSize: '0.85rem',
                    lineHeight: '1.3',
                  }}
                >
                  When quantity falls below this value, the item will be added to your shopping list.
                </Form.Text>

                <div className="invalid-feedback d-block">{errors.restockThreshold?.message}</div>
              </Form.Group>
            </Col>
          </Row>
          <input type="hidden" {...register('owner')} value={produce.owner} />
          <Form.Group className="form-group">
            <Row className="pt-3">
              <Col>
                <Button type="submit" className="btn-submit">
                  Submit
                </Button>
              </Col>
              <Col>
                <Button type="button" onClick={() => reset()} variant="warning" className="btn-reset">
                  Reset
                </Button>
              </Col>
            </Row>
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddProduceModal;

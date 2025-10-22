'use client';

import { Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { yupResolver } from '@hookform/resolvers/yup';
import { Produce } from '@prisma/client';
import { EditProduceSchema } from '@/lib/validationSchemas';
import { editProduce } from '@/lib/dbActions';
import { InferType } from 'yup';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import '../../styles/buttons.css';

type ProduceValues = InferType<typeof EditProduceSchema>;

interface EditProduceModalProps {
  show: boolean;
  onHide: () => void;
  produce: Produce & { restockThreshold?: number | null };
}

const EditProduceModal = ({ show, onHide, produce }: EditProduceModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProduceValues>({
    resolver: yupResolver(EditProduceSchema),
  });

  const router = useRouter();

  const unitOptions = useMemo(() => ['kg', 'g', 'lb', 'oz', 'pcs', 'ml', 'l', 'Other'], []);
  const [unitChoice, setUnitChoice] = useState(unitOptions.includes(produce.unit) ? produce.unit : 'Other');

  useEffect(() => {
    if (!show) {
      reset({
        ...produce,
        expiration: produce.expiration
          ? produce.expiration.toISOString().split('T')[0]
          : '',
        image: produce.image ?? '',
      } as any);
      setUnitChoice(unitOptions.includes(produce.unit) ? produce.unit : 'Other');
    }
  }, [show, produce, reset, unitOptions]);

  const handleClose = () => {
    reset({
      ...produce,
      expiration: produce.expiration ? produce.expiration.toISOString().split('T')[0] : '',
      image: produce.image ?? '',
    } as any);
    setUnitChoice(unitOptions.includes(produce.unit) ? produce.unit : 'Other');
    onHide();
  };

  const onSubmit = async (data: ProduceValues) => {
    await editProduce({
      ...data,
      expiration: data.expiration ?? null,
      image: data.image === '' ? null : data.image,
      restockThreshold: data.restockThreshold ? Number(data.restockThreshold) : 0,
    });
    swal('Success', 'Your item has been updated', 'success', { timer: 2000 });
    handleClose();
    router.refresh();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="justify-content-center">
        <Modal.Title>Edit Pantry Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('id')} value={produce.id} />

          <Row className="mb-3">
            <Col xs={6} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0 required-field">Name</Form.Label>
                <Form.Control
                  type="text"
                  {...register('name')}
                  defaultValue={produce.name}
                  required
                  className={`${errors.name ? 'is-invalid' : ''}`}
                  placeholder="e.g., Chicken"
                />
                <div className="invalid-feedback">{errors.name?.message}</div>
              </Form.Group>
            </Col>

            <Col xs={6} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0 required-field">Type</Form.Label>
                <Form.Control
                  type="text"
                  {...register('type')}
                  required
                  defaultValue={produce.type}
                  className={`${errors.type ? 'is-invalid' : ''}`}
                  placeholder="e.g., Meat"
                />
                <div className="invalid-feedback">{errors.type?.message}</div>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xs={6} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0 required-field">Location</Form.Label>
                <Form.Control
                  type="text"
                  {...register('location')}
                  required
                  defaultValue={produce.location}
                  className={`${errors.location ? 'is-invalid' : ''}`}
                  placeholder="e.g., Freezer"
                />
                <div className="invalid-feedback">{errors.location?.message}</div>
              </Form.Group>
            </Col>
            <Col xs={6} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0 required-field">Storage</Form.Label>
                <Form.Control
                  type="text"
                  {...register('storage')}
                  required
                  defaultValue={produce.storage || ''}
                  className={`${errors.storage ? 'is-invalid' : ''}`}
                  placeholder="e.g., Fridge, Pantry, Freezer"
                />
                <div className="invalid-feedback">{errors.storage?.message}</div>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col xs={6} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0 required-field">Quantity</Form.Label>
                <Form.Control
                  type="number"
                  {...register('quantity')}
                  required
                  defaultValue={produce.quantity}
                  step={0.5}
                  placeholder="eg., 1, 1.5"
                  className={`${errors.quantity ? 'is-invalid' : ''}`}
                />
                <div className="invalid-feedback">{errors.quantity?.message}</div>
              </Form.Group>
            </Col>
            <Col xs={6} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0 required-field">Unit</Form.Label>
                <Form.Select
                  defaultValue={unitChoice}
                  required
                  className={`${errors.unit ? 'is-invalid' : ''}`}
                  onChange={(e) => {
                    const { value } = e.target;
                    setUnitChoice(value);
                    if (value !== 'Other') {
                      setValue('unit', value);
                    } else {
                      setValue('unit', '');
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
                    required
                    defaultValue={!unitOptions.includes(produce.unit) ? produce.unit : ''}
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
                  defaultValue={produce.expiration ? produce.expiration.toISOString().split('T')[0] : ''}
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
                  defaultValue={produce.image ?? ''}
                  className={`${errors.image ? 'is-invalid' : ''}`}
                  placeholder="Image URL"
                />
                <div className="invalid-feedback">{errors.image?.message}</div>
              </Form.Group>
            </Col>
          </Row>
          <Row className="mb-3">
            <Col xs={12} className="text-center">
              <Form.Group>
                <Form.Label className="mb-1" style={{ fontWeight: '500' }}>
                  Restock Threshold
                </Form.Label>

                <div className="d-flex justify-content-center mb-2">
                  <Form.Control
                    type="number"
                    step={0.5}
                    {...register('restockThreshold')}
                    defaultValue={produce.restockThreshold ?? ''}
                    placeholder="e.g., 0.5"
                    className={`${errors.restockThreshold ? 'is-invalid' : ''}`}
                    style={{ width: '100px' }}
                  />
                </div>
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

export default EditProduceModal;

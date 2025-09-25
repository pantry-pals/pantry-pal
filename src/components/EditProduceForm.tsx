'use client';

import { Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { yupResolver } from '@hookform/resolvers/yup';
import { Produce } from '@prisma/client';
import { EditProduceSchema } from '@/lib/validationSchemas';
import { editProduce } from '@/lib/dbActions';
import { InferType } from 'yup';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type ProduceValues = InferType<typeof EditProduceSchema>;

const EditProduceForm = ({ produce }: { produce: Produce }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProduceValues>({
    resolver: yupResolver(EditProduceSchema),
  });
  // console.log(produce);

  const router = useRouter();

  // Available unit options
  const unitOptions = ['kg', 'g', 'lb', 'oz', 'pcs', 'ml', 'l', 'Other'];

  // Track dropdown state
  const [unitChoice, setUnitChoice] = useState(
    unitOptions.includes(produce.unit) ? produce.unit : 'Other',
  );

  const onSubmit = async (data: ProduceValues) => {
  // console.log(`onSubmit data: ${JSON.stringify(data, null, 2)}`);
    await editProduce({
      ...data,
      expiration: data.expiration ?? null,
      image: data.image === '' ? null : data.image,
    });
    swal('Success', 'Your item has been updated', 'success', {
      timer: 2000,
    });

    router.push('/view-pantry');
    router.refresh();
  };

  return (
    <Container className="py-3">
      <Row className="justify-content-center">
        <Col xs={5}>
          <Col className="text-center">
            <h2>Edit Produce</h2>
          </Col>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <input type="hidden" {...register('id')} value={produce.id} />
                <Form.Group>
                  <Form.Label>Name</Form.Label>
                  <input
                    type="text"
                    {...register('name')}
                    defaultValue={produce.name}
                    required
                    className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  />
                  <div className="invalid-feedback">{errors.name?.message}</div>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Type</Form.Label>
                  <input
                    type="text"
                    {...register('type')}
                    defaultValue={produce.type}
                    className={`form-control ${errors.type ? 'is-invalid' : ''}`}
                  />
                  <div className="invalid-feedback">{errors.type?.message}</div>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Location</Form.Label>
                  <input
                    type="text"
                    {...register('location')}
                    defaultValue={produce.location}
                    className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                  />
                  <div className="invalid-feedback">{errors.location?.message}</div>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Quantity</Form.Label>
                  <input
                    type="number"
                    {...register('quantity')}
                    defaultValue={produce.quantity}
                    step={0.1}
                    className={`form-control ${errors.quantity ? 'is-invalid' : ''}`}
                  />
                  <div className="invalid-feedback">{errors.quantity?.message}</div>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Unit</Form.Label>
                  <select
                    value={unitChoice}
                    className={`form-control ${errors.unit ? 'is-invalid' : ''}`}
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
                  </select>

                  {unitChoice === 'Other' && (
                    <input
                      type="text"
                      {...register('unit')}
                      defaultValue={
                        !unitOptions.includes(produce.unit) ? produce.unit : ''
                      }
                      placeholder="Enter custom unit"
                      className={`form-control mt-2 ${errors.unit ? 'is-invalid' : ''}`}
                    />
                  )}
                  <div className="invalid-feedback">{errors.unit?.message}</div>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Expiration Date</Form.Label>
                  <input
                    type="date"
                    {...register('expiration')}
                    defaultValue={produce.expiration ? produce.expiration.toISOString().split('T')[0] : ''}
                    className={`form-control ${errors.expiration ? 'is-invalid' : ''}`}
                  />
                  <div className="invalid-feedback">{errors.expiration?.message}</div>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Image</Form.Label>
                  <input
                    type="url"
                    {...register('image')}
                    defaultValue={produce.image ?? ''}
                    className={`form-control ${errors.image ? 'is-invalid' : ''}`}
                  />
                  <div className="invalid-feedback">{errors.image?.message}</div>
                </Form.Group>
                <input type="hidden" {...register('owner')} value={produce.owner} />
                <Form.Group className="form-group">
                  <Row className="pt-3">
                    <Col>
                      <Button type="submit" variant="primary">
                        Submit
                      </Button>
                    </Col>
                    <Col>
                      <Button type="button" onClick={() => reset()} variant="warning" className="float-right">
                        Reset
                      </Button>
                    </Col>
                  </Row>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default EditProduceForm;

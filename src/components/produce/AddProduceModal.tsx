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
import BarcodeScanner from './BarcodeScanner';
import '../../styles/buttons.css';

type ProduceValues = InferType<typeof AddProduceSchema>;

interface AddProduceModalProps {
  show: boolean;
  onHide: () => void;
  produce: Produce;
}

const AddProduceModal = ({ show, onHide, produce }: AddProduceModalProps) => {
  const [locations, setLocations] = useState<string[]>([]);
  const [storageOptions, setStorageOptions] = useState<string[]>([]);

  const unitOptions = useMemo(() => ['kg', 'g', 'lb', 'oz', 'pcs', 'ml', 'l', 'Other'], []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProduceValues>({
    resolver: yupResolver(AddProduceSchema),
    defaultValues: { location: '', storage: '', unit: unitOptions[0] },
  });

  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState(produce.location || '');
  const [selectedStorage, setSelectedStorage] = useState(produce.storage || '');
  const [unitChoice, setUnitChoice] = useState(unitOptions[0]);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (!show) reset();
    setSelectedLocation('');
    setSelectedStorage('');
    setUnitChoice('');

    const fetchLocations = async () => {
      const res = await fetch(`/api/produce/${produce.id}/locations?owner=${produce.owner}`);
      if (!res.ok) return;
      const data = await res.json();
      setLocations(data);
    };
    fetchLocations();

    const fetchStorage = async () => {
      const res = await fetch(`/api/produce/${produce.id}/storage?owner=${produce.owner}`);
      if (!res.ok) return;
      const data = await res.json();
      setStorageOptions(data);
    };
    fetchStorage();
  }, [show, reset, produce.id, produce.owner]);

  const handleClose = () => {
    reset();
    setSelectedLocation('');
    setSelectedStorage('');
    setUnitChoice('');
    onHide();
  };

  const fetchProductByBarcode = async (barcode: string) => {
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();

      if (data.status === 1) {
        const { product } = data;
        setValue('name', product.product_name || '');
        setValue('image', product.image_url || '');
        setValue('type', product.categories_tags?.[0]?.replace('en:', '') || '');
      } else {
        swal('Not found', 'No product found for this barcode', 'warning');
      }
    } catch (err) {
      swal('Error', 'Failed to fetch product info', 'error');
    }
  };

  const onSubmit = async (data: ProduceValues) => {
    await addProduce({
      ...data,
      expiration: data.expiration ?? null,
      image: data.image || null,
      restockThreshold: Number(data.restockThreshold ?? 0),
    });

    swal('Success', 'Your item has been added', 'success', { timer: 2000 });
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
          {/* Barcode Scanner Button */}
          <Row className="mb-3">
            <Col xs={12} className="text-center">
              <Button
                type="button"
                variant="info"
                size="sm"
                className="mb-2"
                onClick={() => setShowScanner(true)}
              >
                Scan Barcode
              </Button>

              {showScanner && (
                <BarcodeScanner
                  onDetected={(code) => {
                    fetchProductByBarcode(code);
                    setShowScanner(false);
                  }}
                  onClose={() => setShowScanner(false)}
                />
              )}
            </Col>
          </Row>

          {/* Name and Type */}
          <Row className="mb-3">
            <Col xs={6} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0 required-field">Name</Form.Label>
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
                <Form.Label className="mb-0 required-field">Type</Form.Label>
                <Form.Control
                  type="text"
                  {...register('type')}
                  required
                  className={`${errors.type ? 'is-invalid' : ''}`}
                  placeholder="e.g., Meat"
                />
                <div className="invalid-feedback">{errors.type?.message}</div>
              </Form.Group>
            </Col>
          </Row>

          {/* Location and Storage */}
          <Row className="mb-3">
            <Col xs={6} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0 required-field">Location</Form.Label>
                <Form.Select
                  {...register('location', { required: true })}
                  value={selectedLocation}
                  required
                  className={`${errors.location ? 'is-invalid' : ''}`}
                  onChange={(e) => {
                    const { value } = e.target;
                    setValue('location', value === 'Add Location' ? '' : value);
                    setSelectedLocation(value); // custom state, see below
                  }}
                >
                  <option value="" disabled>Select location...</option>

                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                  <option value="Add Location">Add Location</option>
                </Form.Select>

                {/* Conditionally render the custom input */}
                {selectedLocation === 'Add Location' && (
                  <Form.Control
                    type="text"
                    {...register('location', { required: true })}
                    placeholder="Enter new location"
                    required
                    className={`mt-2 ${errors.location ? 'is-invalid' : ''}`}
                  />
                )}

                <div className="invalid-feedback">{errors.location?.message}</div>
              </Form.Group>
            </Col>
            <Col xs={6} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0 required-field">Storage</Form.Label>
                <Form.Select
                  {...register('storage', { required: true })}
                  value={selectedStorage}
                  required
                  className={`${errors.storage ? 'is-invalid' : ''}`}
                  onChange={(e) => {
                    const { value } = e.target;
                    setValue('storage', value === 'Add Storage' ? '' : value);
                    setSelectedStorage(value); // custom state, see below
                  }}
                >
                  <option value="" disabled>Select storage...</option>

                  {storageOptions.map((storage) => (
                    <option key={storage} value={storage}>
                      {storage}
                    </option>
                  ))}
                  <option value="Add Storage">Add Storage</option>
                </Form.Select>

                {/* Conditionally render the custom input */}
                {selectedStorage === 'Add Storage' && (
                  <Form.Control
                    type="text"
                    {...register('storage', { required: true })}
                    placeholder="Enter new storage"
                    required
                    className={`mt-2 ${errors.storage ? 'is-invalid' : ''}`}
                  />
                )}

                <div className="invalid-feedback">{errors.storage?.message}</div>
              </Form.Group>
            </Col>
          </Row>

          {/* Quantity and Unit */}
          <Row className="mb-3">
            <Col xs={6} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0 required-field">Quantity</Form.Label>
                <Form.Control
                  type="number"
                  {...register('quantity')}
                  required
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
                  value={unitChoice}
                  required
                  className={`${errors.unit ? 'is-invalid' : ''}`}
                  onChange={(e) => {
                    const { value } = e.target;
                    setUnitChoice(value);
                    setValue('unit', value !== 'Other' ? value : '');
                  }}
                >
                  <option value="" disabled>Select unit...</option>
                  {unitOptions.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </Form.Select>

                {unitChoice === 'Other' && (
                  <Form.Control
                    type="text"
                    {...register('unit')}
                    placeholder="Enter custom unit"
                    required
                    className={`mt-2 ${errors.unit ? 'is-invalid' : ''}`}
                  />
                )}
                <div className="invalid-feedback">{errors.unit?.message}</div>
              </Form.Group>
            </Col>
          </Row>

          {/* Expiration and Image */}
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

          {/* Restock Threshold */}
          <Row>
            <Col xs={12} className="text-center">
              <Form.Group>
                <Form.Label className="mb-0">Restock Threshold</Form.Label>
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
                  style={{ maxWidth: '320px', fontSize: '0.85rem', lineHeight: '1.3' }}
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
                <Button type="submit" className="btn-submit">Submit</Button>
              </Col>
              <Col>
                <Button type="button" onClick={() => reset()} variant="warning" className="btn-reset">Reset</Button>
              </Col>
            </Row>
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddProduceModal;

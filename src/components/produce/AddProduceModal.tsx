'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Col,
  Form,
  Modal,
  Row,
  InputGroup,
  Image as RBImage,
} from 'react-bootstrap';
import { useForm, type SubmitHandler } from 'react-hook-form';
import swal from 'sweetalert';
import { yupResolver } from '@hookform/resolvers/yup';
import { AddProduceSchema } from '@/lib/validationSchemas';
import { addProduce } from '@/lib/dbActions';
import type { InferType } from 'yup';
import { useRouter } from 'next/navigation';
import ImagePickerModal from '@/components/images/ImagePickerModal';
import BarcodeScanner from './BarcodeScanner';
import '../../styles/buttons.css';

// Infer TypeScript types from the Yup schema
type ProduceValues = InferType<typeof AddProduceSchema>;

interface AddProduceModalProps {
  show: boolean;
  onHide: () => void;
  produce?: { owner?: string };
}

export default function AddProduceModal({ show, onHide, produce }: AddProduceModalProps) {
  const unitOptions = useMemo(
    () => ['kg', 'g', 'lb', 'oz', 'pcs', 'ml', 'l', 'Other'],
    [],
  );

  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProduceValues>({
    resolver: yupResolver(AddProduceSchema) as any, // Type alignment workaround for Yup+RHForm
    defaultValues: {
      name: '',
      type: '',
      location: '',
      storage: '',
      quantity: undefined,
      unit: unitOptions[0],
      expiration: null,
      owner: produce?.owner ?? '',
      image: '',
      restockThreshold: null,
    },
  });

  const imageVal = watch('image') || '';
  const [unitChoice, setUnitChoice] = useState(unitOptions[0]);
  const [showScanner, setShowScanner] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [imageAlt, setImageAlt] = useState('');

  useEffect(() => {
    if (!show) reset();
  }, [show, reset]);

  const handleClose = () => {
    reset();
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
    } catch {
      swal('Error', 'Failed to fetch product info', 'error');
    }
  };

  const onSubmit: SubmitHandler<ProduceValues> = async (data) => {
    try {
      await addProduce({
        ...data,
        expiration: data.expiration ?? null,
        image: data.image || null,
        restockThreshold: Number(data.restockThreshold ?? 0),
      });

      swal('Success', 'Your item has been added', 'success', { timer: 2000 });
      handleClose();
      router.refresh();
    } catch {
      swal('Error', 'Failed to add item', 'error');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="justify-content-center">
        <Modal.Title>Add Pantry Item</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit(onSubmit)}>
          {/* Barcode Scanner */}
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
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="required-field">Name</Form.Label>
                <Form.Control
                  type="text"
                  {...register('name')}
                  required
                  placeholder="e.g., Chicken"
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="required-field">Type</Form.Label>
                <Form.Control
                  type="text"
                  {...register('type')}
                  required
                  placeholder="e.g., Meat"
                  isInvalid={!!errors.type}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.type?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Location and Storage */}
          <Row>
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="required-field">Location</Form.Label>
                <Form.Control
                  type="text"
                  {...register('location')}
                  required
                  placeholder="e.g., Pantry"
                  isInvalid={!!errors.location}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.location?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="required-field">Storage</Form.Label>
                <Form.Control
                  type="text"
                  {...register('storage')}
                  required
                  placeholder="e.g., Freezer"
                  isInvalid={!!errors.storage}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.storage?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Quantity and Unit */}
          <Row className="mb-3 mt-2">
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="required-field">Quantity</Form.Label>
                <Form.Control
                  type="number"
                  step={0.5}
                  {...register('quantity')}
                  required
                  placeholder="e.g., 1, 1.5"
                  isInvalid={!!errors.quantity}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.quantity?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="required-field">Unit</Form.Label>
                <Form.Select
                  defaultValue={unitOptions[0]}
                  onChange={(e) => {
                    const { value } = e.target;
                    setUnitChoice(value);
                    setValue('unit', value !== 'Other' ? value : '');
                  }}
                  isInvalid={!!errors.unit}
                >
                  {unitOptions.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </Form.Select>
                {unitChoice === 'Other' && (
                  <Form.Control
                    type="text"
                    {...register('unit')}
                    placeholder="Enter custom unit"
                    required
                    className="mt-2"
                    isInvalid={!!errors.unit}
                  />
                )}
                <Form.Control.Feedback type="invalid">
                  {errors.unit?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Expiration and Image */}
          <Row className="mb-3">
            <Col xs={6}>
              <Form.Group>
                <Form.Label>Expiration Date</Form.Label>
                <Form.Control
                  type="date"
                  {...register('expiration')}
                  isInvalid={!!errors.expiration}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.expiration?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={6}>
              <Form.Group>
                <Form.Label>Image</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    {...register('image')}
                    placeholder="Image URL"
                    isInvalid={!!errors.image}
                  />
                  <Button
                    variant="outline-secondary"
                    type="button"
                    style={{ display: 'inline-block', zIndex: 99 }}
                    onClick={() => setShowPicker(true)}
                  >
                    Pick
                  </Button>
                </InputGroup>
                <Form.Control.Feedback type="invalid">
                  {errors.image?.message}
                </Form.Control.Feedback>

                {imageVal && (
                  <div className="mt-2">
                    <RBImage
                      src={imageVal}
                      alt={imageAlt || 'Preview'}
                      style={{
                        maxHeight: 120,
                        borderRadius: 8,
                        objectFit: 'cover',
                      }}
                      thumbnail
                    />
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>
          {/* Restock Threshold */}
          <Row className="mb-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label>Restock Threshold</Form.Label>
                <Form.Control
                  type="number"
                  step={0.1}
                  {...register('restockThreshold')}
                  placeholder="e.g., 0.5"
                  isInvalid={!!errors.restockThreshold}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.restockThreshold?.message}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  When quantity falls below this value, the item will be added to your shopping list.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <input type="hidden" {...register('owner')} value={produce?.owner ?? ''} />

          <div className="d-flex justify-content-between mt-4">
            <Button type="submit" className="btn-submit">
              Submit
            </Button>
            <Button
              type="button"
              variant="warning"
              onClick={() => reset()}
              className="btn-reset"
            >
              Reset
            </Button>
          </div>
        </Form>
      </Modal.Body>

      <ImagePickerModal
        show={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(url, meta) => {
          setValue('image', url, { shouldValidate: true, shouldDirty: true });
          if (meta?.alt) setImageAlt(meta.alt);
        }}
      />
    </Modal>
  );
}

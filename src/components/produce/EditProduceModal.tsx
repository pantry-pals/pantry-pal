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
import { useForm } from 'react-hook-form';
import swal from 'sweetalert';
import { yupResolver } from '@hookform/resolvers/yup';
import { EditProduceSchema } from '@/lib/validationSchemas';
import { editProduce } from '@/lib/dbActions';
import type { InferType } from 'yup';
import { useRouter } from 'next/navigation';
import ImagePickerModal from '@/components/images/ImagePickerModal';
import '../../styles/buttons.css';

type ProduceValues =
  Omit<InferType<typeof EditProduceSchema>, 'expiration'> & {
    expiration: string | null;
  };

interface EditProduceModalProps {
  show: boolean;
  onHide: () => void;
  produce: {
    id: number;
    name: string;
    type: string;
    location: string;
    storage: string;
    quantity: number;
    unit: string;
    expiration: Date | null;
    owner: string;
    image?: string | null;
    restockThreshold?: number | null;
  };
}

export default function EditProduceModal({ show, onHide, produce }: EditProduceModalProps) {
  const router = useRouter();

  const [locations, setLocations] = useState<string[]>([]);
  const [storageOptions, setStorageOptions] = useState<string[]>([]);

  const [selectedLocation, setSelectedLocation] = useState(produce.location || '');
  const [selectedStorage, setSelectedStorage] = useState(produce.storage || '');

  const unitOptions = useMemo(
    () => ['kg', 'g', 'lb', 'oz', 'pcs', 'ml', 'l', 'Other'],
    [],
  );

  const [unitChoice, setUnitChoice] = useState(
    unitOptions.includes(produce.unit) ? produce.unit : 'Other',
  );

  // Image picker modal state
  const [showPicker, setShowPicker] = useState(false);
  const [imageAlt, setImageAlt] = useState('');

  // RHF setup
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProduceValues>({
    resolver: yupResolver(EditProduceSchema) as any,
    defaultValues: {
      ...produce,
      expiration: produce.expiration
        ? produce.expiration.toISOString().split('T')[0]
        : null,
      image: produce.image ?? '',
      restockThreshold: produce.restockThreshold ?? null,
    },
  });

  const imageVal = watch('image') || '';

  useEffect(() => {
    if (show) {
      reset({
        ...produce,
        expiration: produce.expiration
          ? produce.expiration.toISOString().split('T')[0]
          : '',
        image: produce.image ?? '',
        restockThreshold: produce.restockThreshold ?? null,
      });
      setSelectedLocation(produce.location);
      setSelectedStorage(produce.storage);
      setUnitChoice(unitOptions.includes(produce.unit) ? produce.unit : 'Other');
    }

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
  }, [show, produce, reset, unitOptions]);

  const handleClose = () => {
    reset();
    onHide();
  };

  const onSubmit = async (data: ProduceValues) => {
    try {
      await editProduce({
        ...data,
        expiration: data.expiration ? new Date(data.expiration) : null,
        image: data.image === '' ? null : data.image,
        restockThreshold: data.restockThreshold
          ? Number(data.restockThreshold)
          : 0,
      });
      swal('Success', 'Your item has been updated', 'success', { timer: 2000 });
      handleClose();
      router.refresh();
    } catch (err) {
      swal('Error', 'Failed to update item', 'error');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="justify-content-center">
        <Modal.Title>Edit Pantry Item</Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('id')} value={produce.id} />

          {/* Name + Type */}
          <Row className="mb-3">
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="mb-0 required-field">Name</Form.Label>
                <Form.Control
                  type="text"
                  {...register('name')}
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
                <Form.Label className="mb-0 required-field">Type</Form.Label>
                <Form.Control
                  type="text"
                  {...register('type')}
                  placeholder="e.g., Meat"
                  isInvalid={!!errors.type}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.type?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Location + Storage */}
          <Row className="mb-3">
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="mb-0 required-field">Location</Form.Label>
                <Form.Select
                  {...register('location', { required: true })}
                  defaultValue={produce.location}
                  className={`${errors.location ? 'is-invalid' : ''}`}
                  onChange={(e) => {
                    const { value } = e.target;
                    setValue('location', value !== 'Add Location' ? value : '');
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
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="mb-0 required-field">Storage</Form.Label>
                <Form.Select
                  {...register('storage', { required: true })}
                  defaultValue={produce.storage}
                  className={`${errors.storage ? 'is-invalid' : ''}`}
                  onChange={(e) => {
                    const { value } = e.target;
                    setValue('storage', value !== 'Add Storage' ? value : '');
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

          {/* Quantity + Unit */}
          <Row className="mb-3">
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="mb-0 required-field">Quantity</Form.Label>
                <Form.Control
                  type="number"
                  step={0.5}
                  {...register('quantity')}
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
                <Form.Label className="mb-0 required-field">Unit</Form.Label>
                <Form.Select
                  value={unitChoice}
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

          {/* Restock Threshold */}
          <Row className="mb-3">
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="mb-0">Restock Threshold</Form.Label>
                <Form.Control
                  type="number"
                  step={0.5}
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

          {/* Expiration + Image (with picker) */}
          <Row className="mb-3">
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="mb-0">Expiration Date</Form.Label>
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
                <Form.Label className="mb-0">Image</Form.Label>
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

          <input type="hidden" {...register('owner')} value={produce.owner} />

          {/* Buttons */}
          <Row className="d-flex justify-content-between mt-4">
            <Col xs={6}>
              <Button type="submit" className="btn-submit">
                Save Changes
              </Button>
            </Col>
            <Col xs={6}>
              <Button
                type="button"
                variant="warning"
                onClick={() => reset()}
                className="btn-reset"
              >
                Reset
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      {/* Image Picker Modal */}
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

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
import { useForm, type SubmitHandler, type Resolver } from 'react-hook-form';
import swal from 'sweetalert';
import { yupResolver } from '@hookform/resolvers/yup';
import { AddProduceSchema } from '@/lib/validationSchemas';
import { addProduce } from '@/lib/dbActions';
import { useRouter } from 'next/navigation';
import ImagePickerModal from '@/components/images/ImagePickerModal';
import BarcodeScanner from './BarcodeScanner';
import '../../styles/buttons.css';

/** Form value shape used by RHF (kept independent from Prisma model). */
type ProduceValues = {
  id: number
  name: string;
  type: string;
  location: string;
  storage: string;
  quantity: number;
  unit: string;
  /** HTML date input gives a string (yyyy-mm-dd) or '' -> we store string|null in the form. */
  expiration: string | null;
  owner: string;
  image: string; // keep as string in the form; convert to null on submit if empty
  restockThreshold: number | null;
};

/** Props */
interface AddProduceModalProps {
  show: boolean;
  onHide: () => void;
  // eslint-disable-next-line react/require-default-props
  produce?: {
    id?: number;
    name?: string;
    type?: string;
    location?: string;
    storage?: string;
    quantity?: number;
    unit?: string;
    expiration?: Date | string | null;
    owner?: string;
    image?: string | null;
    restockThreshold?: number | null;
  };
}

export default function AddProduceModal({ show, onHide, produce }: AddProduceModalProps) {
  const [locations, setLocations] = useState<string[]>([]);
  const [storageOptions, setStorageOptions] = useState<string[]>([]);

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
    // Ensure resolver is typed for ProduceValues to avoid generic inference errors.
    resolver: yupResolver(AddProduceSchema) as unknown as Resolver<ProduceValues>,
    // defaultValues is DeepPartial<ProduceValues>; everything here aligns with the field types above.
    defaultValues: {
      name: '',
      type: '',
      location: '',
      storage: '',
      quantity: 0,
      unit: '',
      expiration: null,
      owner: produce?.owner ?? '',
      image: '',
      restockThreshold: null,
    },
  });

  const imageVal = watch('image') || '';
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [unitChoice, setUnitChoice] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [imageAlt, setImageAlt] = useState('');

  useEffect(() => {
    if (show) {
      reset();
      setSelectedLocation('');
      setSelectedStorage('');
      setUnitChoice('');
    }

    const fetchLocations = async () => {
      if (!produce) return;
      const res = await fetch(`/api/produce/${produce.id}/locations?owner=${produce.owner}`);
      if (!res.ok) return;
      const data = await res.json();
      setLocations(data);
    };
    fetchLocations();

    const fetchStorage = async () => {
      if (!produce) return;
      const res = await fetch(`/api/produce/${produce.id}/storage?owner=${produce.owner}`);
      if (!res.ok) return;
      const data = await res.json();
      setStorageOptions(data);
    };
    fetchStorage();
  }, [show, reset, produce, setValue]);

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
        setValue('type', (product.categories_tags?.[0]?.replace('en:', '') || '') as string);
      } else {
        await swal('Not found', 'No product found for this barcode', 'warning');
      }
    } catch {
      await swal('Error', 'Failed to fetch product info', 'error');
    }
  };

  const onSubmit: SubmitHandler<ProduceValues> = async (data) => {
    try {
      // Normalize payload for your DB action.
      const payload = {
        ...data,
        quantity: Number(data.quantity), // ensure number
        expiration: data.expiration ? new Date(data.expiration) : null,
        image: data.image.trim() === '' ? null : data.image.trim(),
        restockThreshold:
          data.restockThreshold == null || Number.isNaN(Number(data.restockThreshold))
            ? 0
            : Number(data.restockThreshold),
      };
      await addProduce(payload);

      await swal('Success', 'Your item has been added', 'success', { timer: 2000 });
      handleClose();
      router.refresh();
    } catch {
      await swal('Error', 'Failed to add item', 'error');
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header className="justify-content-center">
        <Modal.Title>Add Pantry Item</Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center">
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
                  onDetected={async (code) => {
                    await fetchProductByBarcode(code);
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
                <Form.Label className="mb-0 required-field">Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Chicken"
                  isInvalid={!!errors.name}
                  {...register('name')}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name?.message as string}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="mb-0 required-field">Type</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., Meat"
                  isInvalid={!!errors.type}
                  {...register('type')}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.type?.message as string}
                </Form.Control.Feedback>
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
            <Col xs={6}>
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
          <Row className="mb-3 mt-2">
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="mb-0 required-field">Quantity</Form.Label>
                <Form.Control
                  type="number"
                  step={0.5}
                  placeholder="e.g., 1, 1.5"
                  isInvalid={!!errors.quantity}
                  {...register('quantity', { valueAsNumber: true })}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {errors.quantity?.message as string}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="mb-0 required-field">Unit</Form.Label>
                <Form.Select
                  value={unitChoice}
                  required
                  className={`${errors.unit ? 'is-invalid' : ''}`}
                  onChange={(e) => {
                    const { value } = e.target;
                    setUnitChoice(value);
                    setValue('unit', value === 'Other' ? '' : value);
                  }}
                  isInvalid={!!errors.unit}
                >
                  <option value="" disabled>Select unit...</option>
                  {unitOptions.map((u) => (
                    <option key={u}>{u}</option>
                  ))}
                </Form.Select>
                {unitChoice === 'Other' && (
                  <Form.Control
                    type="text"
                    placeholder="Enter custom unit"
                    className="mt-2"
                    isInvalid={!!errors.unit}
                    {...register('unit')}
                    required
                  />
                )}
                <Form.Control.Feedback type="invalid">
                  {errors.unit?.message as string}
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
                  placeholder="e.g., 0.5"
                  isInvalid={!!errors.restockThreshold}
                  {...register('restockThreshold', {
                    setValueAs: (v) => {
                      if (v === '' || v === null || typeof v === 'undefined') return null;
                      const n = Number(v);
                      return Number.isNaN(n) ? null : n;
                    },
                  })}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.restockThreshold?.message as string}
                </Form.Control.Feedback>
                <Form.Text className="text-muted">
                  When quantity falls below this value, the item will be added to your shopping list.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* Expiration and Image */}
          <Row className="mb-3">
            <Col xs={6}>
              <Form.Group>
                <Form.Label className="mb-0">Expiration Date</Form.Label>
                <Form.Control
                  type="date"
                  isInvalid={!!errors.expiration}
                  {...register('expiration')}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.expiration?.message as string}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col xs={6}>
              <Form.Group>
                <Form.Label className="mb-0">Image</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Pick an Image"
                    isInvalid={!!errors.image}
                    {...register('image')}
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
                  {errors.image?.message as string}
                </Form.Control.Feedback>

                {imageVal && (
                  <div className="mt-2">
                    <RBImage
                      src={imageVal}
                      alt={imageAlt || 'Preview'}
                      style={{ maxHeight: 120, borderRadius: 8, objectFit: 'cover' }}
                      thumbnail
                    />
                  </div>
                )}
              </Form.Group>
            </Col>
          </Row>

          {/* owner hidden (kept in form for your add action) */}
          <input type="hidden" {...register('owner')} value={produce?.owner ?? ''} />

          <Row className="d-flex justify-content-between mt-4">
            <Col xs={6}>
              <Button type="submit" className="btn-submit">
                Submit
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

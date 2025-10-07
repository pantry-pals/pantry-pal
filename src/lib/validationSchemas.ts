import * as Yup from 'yup';

export const AddStuffSchema = Yup.object({
  name: Yup.string().required(),
  quantity: Yup.number().positive().required(),
  condition: Yup.string().oneOf(['excellent', 'good', 'fair', 'poor']).required(),
  owner: Yup.string().required(),
});

export const EditStuffSchema = Yup.object({
  id: Yup.number().required(),
  name: Yup.string().required(),
  quantity: Yup.number().positive().required(),
  condition: Yup.string().oneOf(['excellent', 'good', 'fair', 'poor']).required(),
  owner: Yup.string().required(),
});

export const AddProduceSchema = Yup.object({
  name: Yup.string().required(),
  type: Yup.string().required(),
  location: Yup.string().required(),
  quantity: Yup.number().positive().required(),
  unit: Yup.string().required(),
  expiration: Yup.date()
    .nullable()
    .transform((curr: Date | null, orig: string) => (orig === '' ? null : curr))
    .notRequired(),
  owner: Yup.string().required(),
  image: Yup.string().nullable().notRequired(),
});

export const EditProduceSchema = Yup.object({
  id: Yup.number().required(),
  name: Yup.string().required(),
  type: Yup.string().required(),
  location: Yup.string().required(),
  quantity: Yup.number().positive().required(),
  unit: Yup.string().required(),
  expiration: Yup.date()
    .nullable()
    .transform((curr: Date | null, orig: string) => (orig === '' ? null : curr))
    .notRequired(),
  owner: Yup.string().required(),
  image: Yup.string().nullable().notRequired(),
});

export const AddToShoppingListSchema = Yup.object({
  name: Yup.string().trim().required('Produce name is required'),
  quantity: Yup
    .number()
    .typeError('Quantity must be a number')
    .integer('Quantity must be an integer')
    .positive('Quantity must be > 0')
    .required('Quantity is required'),
  shoppingListId: Yup
    .number()
    .typeError('Please choose a shopping list')
    .integer()
    .positive()
    .required('Please choose a shopping list'),
  // allow empty string or valid money with 2 decimals max
  price: Yup
    .string()
    .optional()
    .test('price-format', 'Use like 3.49', (v) => !v || /^\d+(\.\d{1,2})?$/.test(v)),
});

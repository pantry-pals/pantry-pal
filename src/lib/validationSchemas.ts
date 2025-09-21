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
  expiration: Yup.date().required(),
  owner: Yup.string().required(),
});

export const EditProduceSchema = Yup.object({
  id: Yup.number().required(),
  name: Yup.string().required(),
  type: Yup.string().required(),
  location: Yup.string().required(),
  quantity: Yup.number().positive().required(),
  expiration: Yup.date().required(),
  owner: Yup.string().required(),
});

export const AddShoppingListSchema = Yup.object({
  name: Yup.string().required(),
  userId: Yup.number().required(),
});

export const EditShoppingListSchema = Yup.object({
  id: Yup.number().required(),
  name: Yup.string().required(),
  userId: Yup.number().required(),
});

export const AddShoppingListItemSchema = Yup.object({
  shoppingListId: Yup.number().required(),
  productId: Yup.number().nullable(),
  name: Yup.string().nullable(),
  price: Yup.number().min(0).nullable(),
  quantity: Yup.number().positive().required(),
  notes: Yup.string().nullable(),
}).test(
  'productId-or-name',
  'Either productId or name must be provided',
  (value) => {
    return Boolean(value?.productId || value?.name);
  },
);

export const EditShoppingListItemSchema = Yup.object({
  id: Yup.number().required(),
  shoppingListId: Yup.number().required(),
  productId: Yup.number().nullable(),
  name: Yup.string().nullable(),
  price: Yup.number().min(0).nullable(),
  quantity: Yup.number().positive().required(),
  notes: Yup.string().nullable(),
}).test(
  'productId-or-name',
  'Either productId or name must be provided',
  (value) => {
    return Boolean(value?.productId || value?.name);
  },
);

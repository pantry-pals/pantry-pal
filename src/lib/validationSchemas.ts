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
  type: Yup.string().oneOf(['fruit', 'vegetable']).required(),
  location: Yup.string().oneOf(['pantry', 'fridge', 'freezer']).required(),
  quantity: Yup.number().positive().required(),
  expiration: Yup.date().required(),
});

export const EditProduceSchema = Yup.object({
  name: Yup.string().required(),
  type: Yup.string().oneOf(['fruit', 'vegetable']).required(),
  location: Yup.string().oneOf(['pantry', 'fridge', 'freezer']).required(),
  quantity: Yup.number().positive().required(),
  expiration: Yup.date().required(),
});

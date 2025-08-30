import * as yup from 'yup';

export const unitSchema = yup.object({
  name: yup.string().required('نام واحد الزامی است'),
});

export type UnitFormData = yup.InferType<typeof unitSchema>;
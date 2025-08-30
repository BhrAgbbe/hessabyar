import * as yup from 'yup';

export const groupSchema = yup.object({
  name: yup.string().required('نام گروه الزامی است'),
});

export type GroupFormData = yup.InferType<typeof groupSchema>;
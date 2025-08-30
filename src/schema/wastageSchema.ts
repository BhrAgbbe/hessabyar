import * as yup from 'yup';

export const wastageSchema = yup.object({
  productId: yup.number()
    .min(1, 'انتخاب کالا الزامی است')
    .defined('انتخاب کالا الزامی است'),

  quantity: yup.number()
    .typeError('تعداد باید عدد باشد')
    .min(1, 'تعداد باید حداقل ۱ باشد')
    .required('تعداد الزامی است') 
    .defined(),

  reason: yup.string()
    .defined('علت کسری الزامی است'), 
});

export type WastageFormData = yup.InferType<typeof wastageSchema>;
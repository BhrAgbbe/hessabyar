import * as yup from 'yup';
import type { MoeinCategory } from '../store/slices/customersSlice';

const moeinCategories: MoeinCategory[] = ['بدهکاران', 'طلبکاران', 'همکاران', ' متفرقه', 'ضایعات'];

const phoneRegex = /^09\d{9}$/;

export const customerSchema = yup.object({
  name: yup.string().trim().required('نام شخص الزامی است'),
  phone: yup
    .string()
    .trim()
    .required('شماره همراه الزامی است')
    .matches(phoneRegex, 'شماره همراه باید 11 رقمی و با 09 شروع شود'),
  city: yup.string().nullable().optional(),
  address: yup.string().nullable().optional(),
  moein: yup
    .mixed<MoeinCategory>()
    .oneOf(moeinCategories, 'مقدار معین نامعتبر است')
    .optional(),
  debt: yup
    .number()
    .typeError('مقدار بدهی باید عدد باشد')
    .optional()
    .default(0),
}).required();

export type CustomerFormData = yup.InferType<typeof customerSchema>;


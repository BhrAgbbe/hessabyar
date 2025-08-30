import * as yup from 'yup';
import type { ProductFormData } from '../store/slices/productsSlice';

export const productSchema: yup.ObjectSchema<ProductFormData> = yup.object({
  name: yup.string()
    .required('نام کالا الزامی است'),
  
  groupId: yup.number()
    .typeError('گروه کالا باید عدد باشد')
    .min(1, 'گروه کالا الزامی است')
    .required('گروه کالا الزامی است'),

  unitId: yup.number()
    .typeError('واحد کالا باید عدد باشد')
    .min(1, 'واحد کالا الزامی است')
    .required('واحد کالا الزامی است'),

  model: yup.string().optional().default(''), 

  purchasePrice: yup.number()
    .typeError('قیمت خرید باید عدد باشد')
    .min(0, 'قیمت خرید نمی‌تواند منفی باشد')
    .required('قیمت خرید الزامی است'),

  retailPrice: yup.number()
    .typeError('قیمت فروش باید عدد باشد')
    .min(0, 'قیمت فروش نمی‌تواند منفی باشد')
    .required('قیمت فروش الزامی است'),

  wholesalePrice: yup.number()
    .typeError('قیمت عمده باید عدد باشد')
    .min(0, 'قیمت عمده نمی‌تواند منفی باشد')
    .required('قیمت فروش عمده الزامی است'),

  warehouseId: yup.number()
    .typeError('کد انبار باید عدد باشد')
    .min(1, 'کد انبار الزامی است')
    .required('کد انبار الزامی است'),

  barcode: yup.string().optional().default(''), 

  allowDuplicate: yup.boolean()
    .required(),
});

export type { ProductFormData } from '../store/slices/productsSlice';
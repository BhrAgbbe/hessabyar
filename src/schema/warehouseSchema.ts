import * as yup from 'yup';

export const warehouseSchema = yup.object({
  name: yup.string().required('نام انبار الزامی است'),
});

export type WarehouseFormData = yup.InferType<typeof warehouseSchema>;
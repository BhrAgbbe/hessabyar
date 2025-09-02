import * as yup from 'yup';
import type { MoeinCategory } from '../types/person';

const moeinCategories: MoeinCategory[] = ['بدهکاران', 'طلبکاران', 'همکاران', ' متفرقه', 'ضایعات'];
const phoneRegex = /^09\d{9}$/;

interface ExistingPerson {
  id: number;
  phone?: string | null;
}

/**
 * @param nameRequiredMessage - پیام خطا برای فیلد نام
 * @param existingPersons - آرایه‌ای از تمام اشخاص موجود برای بررسی شماره تکراری
 * @param currentPersonId - شناسه‌ی شخصی که در حال ویرایش است تا از لیست بررسی تکراری خارج شود
 */
export const createPersonSchema = (
  nameRequiredMessage: string,
  existingPersons: ExistingPerson[] = [],
  currentPersonId: number | null = null
) => {
  return yup.object({
    name: yup.string().trim().required(nameRequiredMessage),
    phone: yup
      .string()
      .trim()
      .required('شماره همراه الزامی است')
      .matches(phoneRegex, 'شماره همراه باید ۱۱ رقمی و با 09 شروع شود')
      .test(
        'is-unique-phone',
        'این شماره همراه قبلا ثبت شده است.',
        (phone) => {
          if (!phone) return true; 

          const foundPerson = existingPersons.find(p => p.phone === phone);

          if (foundPerson) {
          
            return foundPerson.id === currentPersonId;
          }

          return true;
        }
      ),
    city: yup.string().transform(value => value || undefined).optional(),
    address: yup.string().transform(value => value || undefined).optional(),
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
};

export type PersonFormData = yup.InferType<ReturnType<typeof createPersonSchema>>;
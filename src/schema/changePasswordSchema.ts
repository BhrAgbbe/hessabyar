import * as yup from 'yup';

export const changePasswordSchema = yup.object({
  currentPassword: yup.string().required('کلمه عبور فعلی الزامی است'),
  newPassword: yup.string()
    .required('کلمه عبور جدید الزامی است')
    .min(4, 'کلمه عبور باید حداقل ۴ کاراکتر باشد'),
  confirmPassword: yup.string()
    .required('تکرار کلمه عبور جدید الزامی است')
    .oneOf([yup.ref('newPassword')], 'کلمه‌های عبور یکسان نیستند')
});

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const getDefaultValues = (): ChangePasswordFormData => ({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});
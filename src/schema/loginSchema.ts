import * as yup from 'yup';

export const loginSchema = yup.object().shape({
  username: yup.string()
  
    .required('نام کاربری الزامی است'),
  password: yup.string()
    .min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد')
    .required('رمز عبور الزامی است'),
});

export type LoginFormData = yup.InferType<typeof loginSchema>;
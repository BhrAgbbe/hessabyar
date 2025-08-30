import * as yup from 'yup';

export const companySchema = yup.object({
  name: yup.string().required('نام شرکت الزامی است'),
  managerName: yup.string().required('نام مدیر الزامی است'),
  economicCode: yup.string().required('کد اقتصادی الزامی است'),
  phone: yup.string().required('شماره تلفن الزامی است'),
  mobile: yup.string().required('شماره همراه الزامی است'),
  fax: yup.string().nullable(),
  address: yup.string().required('آدرس الزامی است'),
  promoMessage: yup.string().nullable(),
  logo: yup.mixed().nullable(),
});



export type CompanyFormData = yup.InferType<typeof companySchema>;
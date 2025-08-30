import * as yup from 'yup';

export const bankAccountSchema = yup.object({
  bankName: yup.string().required('نام بانک الزامی است'),
  branchName: yup.string().required('نام شعبه الزامی است'),
  branchCode: yup.string().required('کد شعبه الزامی است'),
  accountNumber: yup.string().required('شماره حساب الزامی است'),
  cardNumber: yup.string().optional().nullable(),
  balance: yup
    .number()
    .typeError('موجودی باید عدد باشد')
    .min(0, 'موجودی نمی‌تواند منفی باشد')
    .required('موجودی اولیه الزامی است'),
});

export type BankAccountFormData = yup.InferType<typeof bankAccountSchema>;
import * as yup from 'yup';
import type { User } from '../store/slices/usersSlice';


export type UserFormData = {
    username: string;
    password?: string;
    role: User['role'];
};

const userRoles: User['role'][] = ["مدیر سیستم", "فروشنده", "حسابدار", "انباردار"];

export const createUserSchema: yup.ObjectSchema<UserFormData> = yup.object({
  username: yup.string()
    .required("نام کاربری اجباری است"),
  password: yup.string()
    .min(6, "رمز عبور باید حداقل 6 حرف باشد")
    .required("رمز عبور اجباری است"),
  role: yup.mixed<User['role']>()
    .oneOf(userRoles, "نقش کاربر نامعتبر است")
    .required("انتخاب نقش کاربر اجباری است"),
});

export const editUserSchema: yup.ObjectSchema<UserFormData> = yup.object({
  username: yup.string()
    .required("نام کاربری اجباری است"),
  password: yup.string()
 
    .transform(value => value === '' ? undefined : value)
    .optional()
    .min(4, "رمز عبور باید حداقل ۴ حرف باشد"),
  role: yup.mixed<User['role']>()
    .oneOf(userRoles, "نقش کاربر نامعتبر است")
    .required("انتخاب نقش کاربر اجباری است"),
});
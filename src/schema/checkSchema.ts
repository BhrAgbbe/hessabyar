import * as yup from "yup";
import { type CheckStatus } from "../store/slices/checksSlice";

export interface CheckFormData {
  serial: string;
  amount: number;
  payee: string;
  dueDate: string;
  type: "received" | "issued";
}

export interface EditFormData {
  amount: number;
  dueDate: string;
  status: CheckStatus;
}

export interface UpdateBySerialData {
  serial: string;
  status: CheckStatus;
}

export const checkSchema = yup.object<CheckFormData>().shape({
  serial: yup.string().required("سریال الزامی است"),
  payee: yup.string().required("نام شخص الزامی است"),
  amount: yup
    .number()
    .typeError("مبلغ باید عدد باشد")
    .required("مبلغ الزامی است")
    .positive("مبلغ باید مثبت باشد"),
  dueDate: yup
    .string()
    .required("تاریخ سررسید الزامی است")
    .test('is-valid-date', 'تاریخ نامعتبر است', (value) => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    })
    .test('is-future-date', 'تاریخ باید از ۲۰۰۰-۰۱-۰۱ بعد باشد', (value) => {
      if (!value) return false;
      const date = new Date(value);
      const minDate = new Date("2000-01-01");
      return date >= minDate;
    }),
  type: yup.mixed<"received" | "issued">().oneOf(["received", "issued"]).required(),
});

export const editCheckSchema = yup.object<EditFormData>().shape({
  amount: yup
    .number()
    .typeError("مبلغ باید عدد باشد")
    .required("مبلغ الزامی است")
    .positive("مبلغ باید مثبت باشد"),
  dueDate: yup
    .string() 
    .required("تاریخ سررسید الزامی است")
    .test('is-valid-date', 'تاریخ نامعتبر است', (value) => {
      if (!value) return false;
      const date = new Date(value);
      return !isNaN(date.getTime());
    }),
  status: yup
    .mixed<CheckStatus>()
    .oneOf(["در جریان", "پاس شده", "برگشتی"])
    .required("وضعیت الزامی است"),
});

export const updateBySerialSchema = yup.object<UpdateBySerialData>().shape({
  serial: yup.string().required("سریال الزامی است"),
  status: yup
    .mixed<CheckStatus>()
    .oneOf(["در جریان", "پاس شده", "برگشتی"])
    .required("وضعیت الزامی است"),
});
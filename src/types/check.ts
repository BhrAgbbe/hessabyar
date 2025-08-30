export type CheckStatus = 'در جریان' | 'پاس شده' | 'برگشتی';

export interface Check {
  id: string;
  serial: string;
  amount: number;
  dueDate: string;
  payee: string;
  status: CheckStatus;
  type: 'received' | 'issued';
}
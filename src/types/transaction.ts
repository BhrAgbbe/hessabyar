export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  amount: number;
  type: 'receipt' | 'payment';
  customerId?: number;
  supplierId?: number;
}
export interface InvoiceItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: number;
  customerId: number;
  supplierId: number;
  items: InvoiceItem[];
  issueDate: string;
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  tax: number;
  grandTotal: number;
}

export interface InvoicesState {
  sales: Invoice[];
  proformas: Invoice[];
  salesReturns: Invoice[];
  purchases: Invoice[];
  purchaseReturns: Invoice[];
}
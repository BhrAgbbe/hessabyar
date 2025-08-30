export interface AppSettings {
  checkReminderWarning: boolean;
  checkReminderDays: number;
  invoicePrintSize: 'A4' | 'A5' | 'Receipt';
  syncCustomersToContacts: boolean;
  autoBackupOnExit: boolean;
  allowUserDiscount: boolean;
  autoAddQuantity: boolean;
  useBarcodeScanner: boolean;
  checkStockOnHand: boolean;
  showDebtOnInvoice: boolean;
  showProfitOnInvoice: boolean;
  quickPrintInvoice: boolean;
  backgroundColor: string;
  backgroundImage: string;
  primaryColor: string;
}
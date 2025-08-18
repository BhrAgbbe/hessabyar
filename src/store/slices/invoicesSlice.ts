import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * @interface InvoiceItem
 * @description ساختار هر ردیف در یک فاکتور را مشخص می‌کند.
 */
export interface InvoiceItem {
  productId: number;
  quantity: number;
  unitPrice: number;
}

/**
 * @interface Invoice
 * @description ساختار کلی یک فاکتور را مشخص می‌کند.
 */
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

/**
 * @interface InvoicesState
 * @description ساختار state برای نگهداری انواع مختلف فاکتورها در Redux
 */
interface InvoicesState {
  sales: Invoice[];
  proformas: Invoice[];
  salesReturns: Invoice[];
  purchases: Invoice[];
  purchaseReturns: Invoice[];
}

const initialState: InvoicesState = {
  sales: [],
  proformas: [],
  salesReturns: [],
  purchases: [],
  purchaseReturns: [],
};

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    addInvoice: (state, action: PayloadAction<Omit<Invoice, 'id' | 'invoiceNumber'>>) => {
        const maxInvoiceNum = state.sales.length > 0 ? Math.max(...state.sales.map(inv => inv.invoiceNumber)) : 0;
        const newInvoice: Invoice = {
            ...action.payload,
            id: `SALE-${Date.now()}`,
            invoiceNumber: maxInvoiceNum + 1,
        };
        state.sales.push(newInvoice);
    },
    deleteInvoice: (state, action: PayloadAction<string>) => {
        state.sales = state.sales.filter(inv => inv.id !== action.payload);
    },

    // افزودن پیش فاکتور
    addProforma: (state, action: PayloadAction<Omit<Invoice, 'id' | 'invoiceNumber'>>) => {
      const newProforma: Invoice = { 
        ...action.payload,
        id: `PROF-${Date.now()}`, 
        invoiceNumber: 0,
      }; 
      state.proformas.push(newProforma);
    },

    addSalesReturn: (state, action: PayloadAction<Omit<Invoice, 'id' | 'invoiceNumber'>>) => {
        const newReturn: Invoice = { 
          ...action.payload,
          id: `SRET-${Date.now()}`,
          invoiceNumber: 0,
        }; 
        state.salesReturns.push(newReturn);
    },
    deleteSalesReturn: (state, action: PayloadAction<string>) => {
        state.salesReturns = state.salesReturns.filter(inv => inv.id !== action.payload);
    },

    addPurchase: (state, action: PayloadAction<Omit<Invoice, 'id' | 'invoiceNumber'>>) => {
        const maxPurchaseNum = state.purchases.length > 0 ? Math.max(...state.purchases.map(inv => inv.invoiceNumber)) : 0;
        const newPurchase: Invoice = {
            ...action.payload,
            id: `PUR-${Date.now()}`,
            invoiceNumber: maxPurchaseNum + 1,
        };
        state.purchases.push(newPurchase);
    },
    deletePurchase: (state, action: PayloadAction<string>) => {
        state.purchases = state.purchases.filter(inv => inv.id !== action.payload);
    },

    addPurchaseReturn: (state, action: PayloadAction<Omit<Invoice, 'id' | 'invoiceNumber'>>) => {
      const newPurchaseReturn: Invoice = { 
        ...action.payload,
        id: `PRET-${Date.now()}`,
        invoiceNumber: 0,
      };
      state.purchaseReturns.push(newPurchaseReturn);
    },
    deletePurchaseReturn: (state, action: PayloadAction<string>) => {
        state.purchaseReturns = state.purchaseReturns.filter(inv => inv.id !== action.payload);
    },

    updateInvoice: (state, action: PayloadAction<Invoice>) => {
      const updatedInvoice = action.payload;
      const invoiceTypes: (keyof InvoicesState)[] = ['sales', 'purchases', 'salesReturns', 'purchaseReturns', 'proformas'];

      for (const type of invoiceTypes) {
        const index = state[type].findIndex(inv => inv.id === updatedInvoice.id);
        if (index !== -1) {
          state[type][index] = updatedInvoice;
          break; 
        }
      }
    },
  },
});

export const { 
  addInvoice, 
  deleteInvoice, 
  addProforma, 
  addSalesReturn, 
  deleteSalesReturn,
  addPurchase, 
  deletePurchase,
  addPurchaseReturn,
  deletePurchaseReturn,
  updateInvoice 
} = invoicesSlice.actions;

export default invoicesSlice.reducer;

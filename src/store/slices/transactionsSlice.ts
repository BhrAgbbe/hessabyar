import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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

const initialState: Transaction[] = [];

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (state, action: PayloadAction<Omit<Transaction, 'id'>>) => {
      const newTransaction: Transaction = {
        id: `TXN-${Date.now()}`,
        ...action.payload,
      };
      state.push(newTransaction);
    },
    editTransaction: (state, action: PayloadAction<Transaction>) => {
        const index = state.findIndex(tx => tx.id === action.payload.id);
        if (index !== -1) {
            state[index] = action.payload;
        }
    },
    deleteTransaction: (state, action: PayloadAction<string>) => {
        return state.filter(tx => tx.id !== action.payload);
    }
  },
});

export const { addTransaction, editTransaction, deleteTransaction } = transactionsSlice.actions;
export default transactionsSlice.reducer;
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Transaction } from '../../types/transaction'; 


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
import { createSlice,type PayloadAction } from '@reduxjs/toolkit';
import {type MoeinCategory } from './customersSlice'; 

export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  city?: string;
  address?: string;
  moein?: MoeinCategory;
}

const initialState: Supplier[] = [];

const suppliersSlice = createSlice({
  name: 'suppliers',
  initialState,
  reducers: {
    addSupplier: (state, action: PayloadAction<Omit<Supplier, 'id'>>) => {
      const maxId = state.length > 0 ? Math.max(...state.map(s => s.id)) : 99;
      const newId = maxId < 100 ? 100 : maxId + 1;
      state.push({ id: newId, ...action.payload });
    },
    editSupplier: (state, action: PayloadAction<Supplier>) => {
        const index = state.findIndex(s => s.id === action.payload.id);
        if (index !== -1) state[index] = action.payload;
    },
    deleteSupplier: (state, action: PayloadAction<number>) => {
        return state.filter(s => s.id !== action.payload);
    }
  },
});

export const { addSupplier, editSupplier, deleteSupplier } = suppliersSlice.actions;
export default suppliersSlice.reducer;

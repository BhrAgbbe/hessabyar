import { createSlice,type PayloadAction } from '@reduxjs/toolkit';
import type { Customer } from '../../types/person'; 


const initialState: Customer[] = [];

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    addCustomer: (state, action: PayloadAction<Omit<Customer, 'id'>>) => {
      const maxId = state.length > 0 ? Math.max(...state.map(c => c.id)) : 99;
      const newId = maxId < 100 ? 100 : maxId + 1;
      state.push({ id: newId, ...action.payload });
    },
    editCustomer: (state, action: PayloadAction<Customer>) => {
        const index = state.findIndex(c => c.id === action.payload.id);
        if (index !== -1) state[index] = action.payload;
    },
    deleteCustomer: (state, action: PayloadAction<number>) => {
        return state.filter(c => c.id !== action.payload);
    }
  },
});

export const { addCustomer, editCustomer, deleteCustomer } = customersSlice.actions;
export default customersSlice.reducer;

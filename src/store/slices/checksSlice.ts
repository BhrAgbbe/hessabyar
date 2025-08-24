import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

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

const initialState: Check[] = [];

const checksSlice = createSlice({
  name: 'checks',
  initialState,
  reducers: {
    addCheck: (state, action: PayloadAction<Omit<Check, 'id' | 'status'>>) => {
      const newCheck: Check = {
        id: `CHK-${Date.now()}`,
        status: 'در جریان',
        ...action.payload,
      };
      state.push(newCheck);
    },
    editCheck: (state, action: PayloadAction<Partial<Check> & { id: string }>) => {
      const { id, ...updates } = action.payload;
      const checkIndex = state.findIndex(c => c.id === id);
      if (checkIndex !== -1) {
        state[checkIndex] = { ...state[checkIndex], ...updates };
      }
    },
    deleteCheck: (state, action: PayloadAction<string>) => {
      return state.filter(c => c.id !== action.payload);
    },
  },
});

export const { addCheck, editCheck, deleteCheck } = checksSlice.actions;
export default checksSlice.reducer;

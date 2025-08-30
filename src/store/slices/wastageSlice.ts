import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { WastageEntry } from '../../types/wastage'; 

const initialState: WastageEntry[] = [];

const wastageSlice = createSlice({
  name: 'wastage',
  initialState,
  reducers: {
    addWastage: (state, action: PayloadAction<Omit<WastageEntry, 'id'>>) => {
      const newEntry: WastageEntry = {
        id: new Date().toISOString() + Math.random(),
        ...action.payload,
      };
      state.push(newEntry);
    },
    deleteWastage: (state, action: PayloadAction<string>) => {
      return state.filter(entry => entry.id !== action.payload);
    },
  },
});

export const { addWastage, deleteWastage } = wastageSlice.actions;
export default wastageSlice.reducer;
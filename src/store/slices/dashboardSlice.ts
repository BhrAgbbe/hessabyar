import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Shortcut } from '../../types/dashboard'; 

const initialState: Shortcut[] = [];

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    addShortcut: (state, action: PayloadAction<Shortcut>) => {
      if (!state.find(shortcut => shortcut.id === action.payload.id)) {
        state.push(action.payload);
      }
    },
    removeShortcut: (state, action: PayloadAction<string>) => {
      return state.filter(shortcut => shortcut.id !== action.payload);
    },
    // This reducer will be used to update the order of shortcuts
    setShortcuts: (_state, action: PayloadAction<Shortcut[]>) => {
      return action.payload;
    },
  },
});

export const { addShortcut, removeShortcut, setShortcuts } = dashboardSlice.actions;
export default dashboardSlice.reducer;
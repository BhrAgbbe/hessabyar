import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Shortcut {
  id: string; 
  title: string;
  path: string;
  iconName: string; 
}

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
    setShortcuts: (_state, action: PayloadAction<Shortcut[]>) => {
      return action.payload;
    },
  },
});

export const { addShortcut, removeShortcut, setShortcuts } = dashboardSlice.actions;
export default dashboardSlice.reducer;

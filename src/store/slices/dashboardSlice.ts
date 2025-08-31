// src/store/slices/dashboardSlice.ts

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Shortcut } from '../../types/dashboard';

// 1. Define the state shape as an interface
export interface DashboardState {
  shortcuts: Shortcut[];
}

// 2. Set the initial state to be an object matching the interface
const initialState: DashboardState = {
  shortcuts: [],
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    addShortcut: (state, action: PayloadAction<Shortcut>) => {
      // Normalize state: get the current list, whether the state is malformed (an array) or correct (an object).
      const currentShortcuts = Array.isArray(state)
        ? state
        : Array.isArray(state.shortcuts)
        ? state.shortcuts
        : [];

      const shortcutExists = currentShortcuts.some(
        (shortcut) => shortcut.id === action.payload.id
      );

      if (shortcutExists) {
        // If it exists, just return the state in the correct shape.
        return { shortcuts: currentShortcuts };
      }
      
      // Always return a new, correctly-shaped state object.
      return {
        shortcuts: [...currentShortcuts, action.payload],
      };
    },
    removeShortcut: (state, action: PayloadAction<string>) => {
      const currentShortcuts = Array.isArray(state)
        ? state
        : Array.isArray(state.shortcuts)
        ? state.shortcuts
        : [];
      
      // Always return a new, correctly-shaped state object.
      return {
        shortcuts: currentShortcuts.filter(
          (shortcut) => shortcut.id !== action.payload
        ),
      };
    },
    setShortcuts: (state, action: PayloadAction<Shortcut[]>) => {
      // Always return a new, correctly-shaped state object.
      return {
        shortcuts: action.payload,
      };
    },
  },
});

export const { addShortcut, removeShortcut, setShortcuts } = dashboardSlice.actions;
export default dashboardSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Shortcut } from "../../types/dashboard";
export interface DashboardState {
  shortcuts: Shortcut[];
}
const initialState: DashboardState = {
  shortcuts: [],
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    addShortcut: (state, action: PayloadAction<Shortcut>) => {
      const currentShortcuts = Array.isArray(state)
        ? state
        : Array.isArray(state.shortcuts)
        ? state.shortcuts
        : [];

      const shortcutExists = currentShortcuts.some(
        (shortcut) => shortcut.id === action.payload.id
      );

      if (shortcutExists) {
        return { shortcuts: currentShortcuts };
      }

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
      return {
        shortcuts: currentShortcuts.filter(
          (shortcut) => shortcut.id !== action.payload
        ),
      };
    },
    setShortcuts: (state, action: PayloadAction<Shortcut[]>) => {
      return {
        shortcuts: action.payload,
      };
    },
  },
});

export const { addShortcut, removeShortcut, setShortcuts } =
  dashboardSlice.actions;
export default dashboardSlice.reducer;

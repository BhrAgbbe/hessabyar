import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BaseEntity } from "../../types/base";

const initialState: BaseEntity[] = [
  { id: 1, name: "انبار اصلی" },
  { id: 2, name: "انبار فروشگاه" },
  { id: 3, name: "انبار شماره ۲" },
];

const warehousesSlice = createSlice({
  name: "warehouses",
  initialState,
  reducers: {
    addEntity: (state, action: PayloadAction<Omit<BaseEntity, "id">>) => {
      const newId = Math.max(...state.map((item) => item.id), 0) + 1;
      state.push({ id: newId, ...action.payload });
    },
    editEntity: (state, action: PayloadAction<BaseEntity>) => {
      const index = state.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    deleteEntity: (state, action: PayloadAction<number>) => {
      return state.filter((item) => item.id !== action.payload);
    },
  },
});

export const {
  addEntity: addWarehouse,
  editEntity: editWarehouse,
  deleteEntity: deleteWarehouse,
} = warehousesSlice.actions;
export default warehousesSlice.reducer;

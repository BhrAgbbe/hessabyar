import { createSlice,type PayloadAction } from '@reduxjs/toolkit';

export interface BaseEntity {
  id: number;
  name: string;
}

const initialState: BaseEntity[] = [
  { id: 1, name: 'عدد' },
  { id: 2, name: 'کیلوگرم' },
  { id: 3, name: 'بسته' },
  { id: 4, name: 'کارتن' },
];

const unitsSlice = createSlice({
  name: 'units', 
  initialState,
  reducers: {
    addEntity: (state, action: PayloadAction<Omit<BaseEntity, 'id'>>) => {
      const newId = Math.max(...state.map(item => item.id), 0) + 1;
      state.push({ id: newId, ...action.payload });
    },
    editEntity: (state, action: PayloadAction<BaseEntity>) => {
      const index = state.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    deleteEntity: (state, action: PayloadAction<number>) => {
      return state.filter(item => item.id !== action.payload);
    },
  },
});

export const { addEntity: addUnit, editEntity: editUnit, deleteEntity: deleteUnit } = unitsSlice.actions;
export default unitsSlice.reducer;
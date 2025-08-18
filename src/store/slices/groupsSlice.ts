import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface BaseEntity {
  id: number;
  name: string;
}

const initialState: BaseEntity[] = [
  { id: 1, name: 'نوشیدنی' },
  { id: 2, name: 'لبنیات' },
  { id: 3, name: 'خشکبار' },
];

const groupsSlice = createSlice({
  name: 'groups',
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

export const { addEntity: addGroup, editEntity: editGroup, deleteEntity: deleteGroup } = groupsSlice.actions;
export default groupsSlice.reducer;
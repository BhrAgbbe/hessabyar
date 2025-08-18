import { createSlice,type PayloadAction } from '@reduxjs/toolkit';
export interface User {
  id: number;
  username: string;
  role: 'مدیر سیستم' | 'فروشنده' | 'حسابدار' | 'انباردار';
  password?: string;
}

const initialState: User[] = [];

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<Omit<User, 'id'>>) => {
      const newId = Math.max(...state.map(u => u.id), 0) + 1;
      state.push({ id: newId, ...action.payload });
    },
    editUser: (state, action: PayloadAction<User>) => {
      const index = state.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state[index] = action.payload;
      }
    },
    deleteUser: (state, action: PayloadAction<number>) => {
      return state.filter(user => user.id !== action.payload);
    },
    setAllUsers: (_state, action: PayloadAction<User[]>) => {
      return action.payload; 
    },
  },
});
export const { addUser, editUser, deleteUser, setAllUsers } = usersSlice.actions;
export default usersSlice.reducer;
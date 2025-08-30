import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/user'; 

const initialState: User[] = [
  { id: 1, username: 'Admin', role: 'مدیر سیستم', password: '111111' }
];

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
      if (action.payload === 1) {
        return state;
      }
      return state.filter(user => user.id !== action.payload);
    },
    setAllUsers: (state, action: PayloadAction<User[]>) => {
      const adminUser = state.find(u => u.id === 1);
      const otherUsers = action.payload.filter(u => u.id !== 1);
      
      if(adminUser){
        return [adminUser, ...otherUsers];
      }
      return action.payload;
    },
  },
});
export const { addUser, editUser, deleteUser, setAllUsers } = usersSlice.actions;
export default usersSlice.reducer;
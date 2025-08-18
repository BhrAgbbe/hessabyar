import { createSlice,type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../slices/usersSlice'; 

interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  currentUser: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.isAuthenticated = true;
      state.currentUser = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;

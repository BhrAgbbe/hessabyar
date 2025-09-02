import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/user'; 
import type { AuthState } from '../../types/auth'; 

interface LoginPayload {
  user: User;
  token: string;
}

const initialState: AuthState = {
  isAuthenticated: false,
  currentUser: null,
  token: null, 
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<LoginPayload>) => {
      state.isAuthenticated = true;
      state.currentUser = action.payload.user;
      state.token = action.payload.token; 
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.currentUser = null;
      state.token = null; 
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;

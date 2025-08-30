import type { User } from './user';

export interface AuthState {
  isAuthenticated: boolean;
  currentUser: User | null;
}
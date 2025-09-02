import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { User } from "../../types/user";
import apiClient from "../../lib/apiClient";

interface UsersState {
  users: User[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: UsersState = {
  users: [{ id: 1, username: "Admin", role: "مدیر سیستم", password: "111111" }],
  status: "idle",
  error: null,
};

export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const response = await apiClient.get<User[]>("/users");
  return response.data;
});

export const addNewUser = createAsyncThunk(
  "users/addNewUser",
  async (newUser: Omit<User, "id">) => {
    const response = await apiClient.post<User>("/users", newUser);
    return response.data;
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (user: User) => {
    const { id, ...data } = user;
    const response = await apiClient.put<User>(`/users/${id}`, data);
    return { ...response.data, id };
  }
);

export const removeUser = createAsyncThunk(
  "users/removeUser",
  async (userId: number) => {
    if (userId === 1) {
      throw new Error("کاربر مدیر قابل حذف نیست.");
    }
    await apiClient.delete(`/users/${userId}`);
    return userId;
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setAllUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
      state.status = "succeeded";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.status = "succeeded";
        const otherUsers = action.payload.filter((u) => u.id !== 1).slice(0, 9);
        const nonApiUsers = state.users.filter((u) => u.id === 1);
        state.users = [...nonApiUsers, ...otherUsers];
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "خطا در دریافت کاربران";
      })
      .addCase(addNewUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.users.push(action.payload);
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.users.findIndex(
          (user) => user.id === action.payload.id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(removeUser.fulfilled, (state, action: PayloadAction<number>) => {
        state.users = state.users.filter((user) => user.id !== action.payload);
      });
  },
});

export const { setAllUsers } = usersSlice.actions;

export default usersSlice.reducer;

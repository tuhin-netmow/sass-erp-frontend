import { createSlice } from "@reduxjs/toolkit";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
}

interface AdminState {
  admin: AdminUser | null;
  isAuthenticated: boolean;
}

const initialState: AdminState = {
  admin: null,
  isAuthenticated: false,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdmin: (state, action) => {
      state.admin = action.payload;
      state.isAuthenticated = true;
    },
    clearAdmin: (state) => {
      state.admin = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAdmin, clearAdmin } = adminSlice.actions;
export default adminSlice.reducer;

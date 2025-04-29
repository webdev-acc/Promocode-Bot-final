import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: {
    userName: "",
    userId: null,
    adminAccess: false,
    superuser: false,
    role: "", 
    id: null
  },
};

const templateUsersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = { ...state.currentUser, ...action.payload };
    },
  },
});

export const { setCurrentUser } = templateUsersSlice.actions;
export const selectUsers = (state) => state.users;

export default templateUsersSlice.reducer;

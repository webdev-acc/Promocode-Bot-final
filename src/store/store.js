import { configureStore } from "@reduxjs/toolkit";
import templateFiltersReducer from "./slices/creoFiltersSlice/creoFiltersSlice";
import usersReducer from "./slices/users/usersSlice";

export const store = configureStore({
  reducer: {
    templateFilters: templateFiltersReducer,
    users: usersReducer,
  },
});

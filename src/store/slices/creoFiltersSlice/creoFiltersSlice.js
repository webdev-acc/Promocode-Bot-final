import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  type: "Gambling",
  size: "",
  lang: "",
  tags: [],
  page: 1,
  limit: 10,
};

const templateFiltersSlice = createSlice({
  name: "templateFilters",
  initialState,
  reducers: {
    setType: (state, action) => {
      state.type = action.payload;
    },
    setSize: (state, action) => {
      state.size = action.payload;
    },
    setLang: (state, action) => {
      state.lang = action.payload;
    },
    setTags: (state, action) => {
      state.tags = action.payload;
    },
    resetFilters: (state) => {
      state.size = "";
      state.lang = "";
      state.tags = [];
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
  },
});

export const {
  setType,
  setSize,
  setTags,
  setLang,
  resetFilters,
  setPage,
  setLimit,
} = templateFiltersSlice.actions;
export const selectFilters = (state) => state.templateFilters;

export default templateFiltersSlice.reducer;

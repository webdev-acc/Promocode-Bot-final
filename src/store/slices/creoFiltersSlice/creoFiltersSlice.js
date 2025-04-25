import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  type: "Gambling",
  size: "",
  lang: "",
  tags: [],
  page: 1,
  limit: 10,
  date_from: null,
  date_to: null,
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
      state.date_from = null;
      state.date_to = null;
    },
    setPage: (state, action) => {
      state.page = action.payload;
    },
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
    setDateFrom: (state, action) => {
      state.date_from = action.payload;
    },
    setDateTo: (state, action) => {
      state.date_to = action.payload;
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
  setDateFrom,
  setDateTo,
} = templateFiltersSlice.actions;
export const selectFilters = (state) => state.templateFilters;

export default templateFiltersSlice.reducer;

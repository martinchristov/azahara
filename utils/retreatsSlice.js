import { createSlice } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";

// Type for our state
export const retreatsSlice = createSlice({
  name: "data",
  initialState: {
    retreatsState: [],
  },
  reducers: {
    // Action to set the authentication status
    setRetreatsState: (state, action) => {
      state.retreatsState = action.payload;
    },
  },

  // Special reducer for hydrating the state. Special case for next-redux-wrapper
  extraReducers: {
    [HYDRATE]: (state, action) => {
      return {
        ...state,
        ...action.payload.auth,
      };
    },
  },
});

export const { setRetreatsState } = retreatsSlice.actions;

export const selectRetreatsState = (state) => state.data.retreatsState;

export default retreatsSlice.reducer;

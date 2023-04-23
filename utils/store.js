import { configureStore } from "@reduxjs/toolkit";
import { retreatsSlice } from "./retreatsSlice";
import { createWrapper } from "next-redux-wrapper";

const makeStore = () =>
  configureStore({
    reducer: {
      [retreatsSlice.name]: retreatsSlice.reducer,
    },
    devTools: true,
  });

export const AppStore = makeStore().constructor;
export const AppState = makeStore().getState();
export const AppThunk = makeStore().thunk;

export const wrapper = createWrapper(makeStore);

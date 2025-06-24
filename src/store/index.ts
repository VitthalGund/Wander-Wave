import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import appSlice from "./slices/appSlice";
import flightSlice from "./slices/flightSlice";
import hotelSlice from "./slices/hotelSlice";
import carSlice from "./slices/carSlice";

export const store = configureStore({
  reducer: {
    app: appSlice,
    flights: flightSlice,
    hotels: hotelSlice,
    cars: carSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;

import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import usersReducer from "../parts/users/usersSlice";
import authReducer from "../parts/users/authSlice";
import productsReducer from "../parts/products/productsSlice";

const store = configureStore({
  reducer: {
    users: usersReducer,
    auth: authReducer,
    products: productsReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export default store;

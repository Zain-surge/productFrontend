import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import userReducer from "./userSlice"; // Import user slice
import modalReducer from "./modalSlice";
import ordersReducer from "./ordersSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    user: userReducer, // Add user reducer
    modal: modalReducer,
    orders: ordersReducer,
  },
});

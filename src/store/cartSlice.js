import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      state.items.push(action.payload);
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((item) => item.title !== action.payload);
    },
    clearCart: (state) => {
      state.items = [];
    },
    updateItemQuantity: (state, action) => {
      const { title, change } = action.payload;
      console.log(title, state.items);
      const item = state.items.find((item) => item.title === title);
      if (item) {
        const newQuantity = item.itemQuantity + change;
        if (newQuantity > 0) {
          item.itemQuantity = newQuantity;
        }
      }
    },
  },
});

export const { addToCart, removeFromCart, clearCart, updateItemQuantity } =
  cartSlice.actions;

export default cartSlice.reducer;

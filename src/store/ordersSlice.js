import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  todayOrders: [],
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setTodayOrders(state, action) {
      state.todayOrders = action.payload;
    },
    addOrder(state, action) {
      debugger;
      state.todayOrders.unshift(action.payload); // Add new order to the top
    },
    updateOrderStatus(state, action) {
      const { order_id, status } = action.payload;
      const order = state.todayOrders.find(
        (order) => order.order_id === order_id
      );
      if (order) {
        order.status = status;
      }
    },
    // Optional: delete or reset orders
    resetTodayOrders(state) {
      state.todayOrders = [];
    },
  },
});

export const { setTodayOrders, addOrder, updateOrderStatus, resetTodayOrders } =
  ordersSlice.actions;

export default ordersSlice.reducer;

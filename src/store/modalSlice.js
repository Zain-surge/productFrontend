// store/modalSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showAuthModal: true,
};

const modalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    openAuthModal: (state) => {
      state.showAuthModal = true;
    },
    closeAuthModal: (state) => {
      state.showAuthModal = false;
    },
  },
});

export const { openAuthModal, closeAuthModal } = modalSlice.actions;
export default modalSlice.reducer;

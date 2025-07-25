// store/offersSlice.js
import { createSlice } from "@reduxjs/toolkit";

const offersSlice = createSlice({
  name: "offers",
  initialState: {
    list: [],
  },
  reducers: {
    setOffers: (state, action) => {
      console.log("✅ Redux offers in reducer:", action.payload);

      state.list = action.payload;
      console.log("✅ Redux offers in reducer:", action.payload);
    },
    updateOfferStatus: (state, action) => {
      console.log("✅ Redux offers in reducer:", action.payload);
      const { offer_text, value } = action.payload;
      const offer = state.list.find((o) => o.offer_text === offer_text);
      if (offer) {
        offer.value = value;
      }
    },
  },
});

export const { setOffers, updateOfferStatus } = offersSlice.actions;
export default offersSlice.reducer;

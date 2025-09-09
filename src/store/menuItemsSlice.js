import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const menuItemsSlice = createSlice({
  name: 'menuItems',
  initialState,
  reducers: {
    setMenuItemsLoading: (state, action) => {
      state.loading = action.payload;
    },
    setMenuItems: (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setMenuItemsError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateItemAvailability: (state, action) => {
      const { item_id, new_availability } = action.payload;
      console.log('🔍 Reducer called with:', { item_id, new_availability });
      console.log('🔍 Current items:', state.items.map(item => ({ id: item.id, item_id: item.item_id, title: item.title })));

      const itemIndex = state.items.findIndex(item => item.id === item_id);
      console.log('🔍 Found item at index:', itemIndex);

      if (itemIndex !== -1) {
        // Create a new array with updated item
        state.items = state.items.map((item, index) =>
          index === itemIndex
            ? { ...item, availability: new_availability }
            : item
        );
        console.log('✅ Item availability updated');
      } else {
        console.log('❌ Item not found');
      }
    },
  },
});

export const {
  setMenuItemsLoading,
  setMenuItems,
  setMenuItemsError,
  updateItemAvailability,
} = menuItemsSlice.actions;

export default menuItemsSlice.reducer;
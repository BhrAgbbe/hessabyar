import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '../../types/product'; 


export type ProductFormData = Omit<Product, 'id' | 'stock'>;

const initialState: Product[] = [];

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addProduct: (state, action: PayloadAction<ProductFormData>) => {
      const maxId = state.length > 0 ? Math.max(...state.map(p => p.id)) : 14;
      const newId = maxId < 15 ? 15 : maxId + 1;
      state.push({ id: newId, ...action.payload, stock: {} });
    },
    editProduct: (state, action: PayloadAction<Omit<Product, 'stock'>>) => {
      const index = state.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state[index] = { ...action.payload, stock: state[index].stock };
      }
    },
    deleteProduct: (state, action: PayloadAction<number>) => {
      return state.filter(p => p.id !== action.payload);
    },
    updateStock: (state, action: PayloadAction<{ productId: number; warehouseId: number; quantity: number }>) => {
      const product = state.find(p => p.id === action.payload.productId);
      if (product) {
        if (!product.stock) product.stock = {};
        product.stock[action.payload.warehouseId] = action.payload.quantity;
      }
    },
  },
});

export const { addProduct, editProduct, deleteProduct, updateStock } = productsSlice.actions;
export default productsSlice.reducer;

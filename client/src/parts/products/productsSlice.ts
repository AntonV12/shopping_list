import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ProductType = {
  id: number | null;
  name: string;
  category: string;
  checked: boolean;
  author_id: number;
};

export type statusType = "idle" | "loading" | "succeeded" | "failed";

export type ErrorType = string | null;

interface ProductState {
  products: ProductType[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: ErrorType;
  message: string | null;
}

export const addProduct = createAsyncThunk<ProductType, ProductType, { rejectValue: ErrorType }>(
  "products/addProduct",
  async (product, { rejectWithValue }) => {
    try {
      const response = await fetch("/products/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save user");
      }

      return await response.json();
    } catch (err) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      } else {
        return rejectWithValue("Failed to save user");
      }
    }
  }
);

export const fetchProducts = createAsyncThunk<ProductType[], number, { rejectValue: ErrorType }>(
  "products/fetchProducts",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`/products/fetch/${id}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch products");
      }

      return await response.json();
    } catch (err) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
    }
  }
);

export const updateProduct = createAsyncThunk<ProductType, ProductType, { rejectValue: ErrorType }>(
  "products/updateProduct",
  async (product, { rejectWithValue }) => {
    try {
      const response = await fetch(`/products/update/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(product),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save user");
      }

      return await response.json();
    } catch (err) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
    }
  }
);

export const deleteProduct = createAsyncThunk<number, number, { rejectValue: ErrorType }>(
  "products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`/products/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save user");
      }

      return id;
    } catch (err) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to save user");
    }
  }
);

export const updateProducts = createAsyncThunk<ProductType[], { products: ProductType[] }, { rejectValue: ErrorType }>(
  "products/updateProducts",
  async (products, { rejectWithValue }) => {
    try {
      const response = await fetch(`/products/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(products),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save user");
      }

      return await response.json();
    } catch (err) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      }
      return rejectWithValue("Failed to save user");
    }
  }
);

const initialState: ProductState = {
  products: [],
  status: "idle",
  error: null,
  message: null,
};

const productsSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearProductError(state) {
      state.error = null;
    },
    clearProductMessage(state) {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addProduct.pending, (state) => {
        state.status = "loading";
      })
      .addCase(addProduct.fulfilled, (state, action: PayloadAction<ProductType>) => {
        state.status = "succeeded";
        state.products.push(action.payload);
        state.message = "Продукт успешно добавлен";
      })
      .addCase(addProduct.rejected, (state, action: PayloadAction<ErrorType | undefined>) => {
        state.status = "failed";
        state.error = action.payload || "Failed to save user";
      })
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<ProductType[]>) => {
        state.status = "succeeded";
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action: PayloadAction<ErrorType | undefined>) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch products";
      })
      .addCase(updateProduct.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateProduct.fulfilled, (state, action: PayloadAction<ProductType>) => {
        state.status = "succeeded";
        const index = state.products.findIndex((p) => Number(p.id) === Number(action.payload.id));

        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action: PayloadAction<ErrorType | undefined>) => {
        state.status = "failed";
        state.error = action.payload || "Failed to save user";
      })
      .addCase(deleteProduct.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteProduct.fulfilled, (state, action: PayloadAction<number>) => {
        state.status = "succeeded";
        state.products = state.products.filter((p) => {
          return p.id != action.payload;
        });
        state.message = "Продукт успешно удален";
      })
      .addCase(deleteProduct.rejected, (state, action: PayloadAction<ErrorType | undefined>) => {
        state.status = "failed";
        state.error = action.payload || "Failed to delete product";
      })
      .addCase(updateProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateProducts.fulfilled, (state, action: PayloadAction<ProductType[]>) => {
        state.status = "succeeded";
        state.products = action.payload;
      })
      .addCase(updateProducts.rejected, (state, action: PayloadAction<ErrorType | undefined>) => {
        state.status = "failed";
        state.error = action.payload || "Failed to save user";
      });
  },
});

export default productsSlice.reducer;
export const { clearProductError, clearProductMessage } = productsSlice.actions;
export const selectAllProducts = (state: { products: { products: ProductType[] } }) => state.products.products;
export const selectProductById = (state: { products: { products: ProductType[] } }, productId: number) =>
  state.products.products.find((product) => product.id === productId);

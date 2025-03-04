import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export type statusType = "idle" | "loading" | "succeeded" | "failed";

type UserType = {
  accessToken: string;
  user: Record<string, number>;
};

interface AuthState {
  user: UserType | null;
  status: statusType;
  error: string | null;
  message: string | null;
}

type ErrorType = string | null;

export const loginUser = createAsyncThunk<
  UserType,
  { login: string; password: string },
  { rejectValue: ErrorType }
>("users/loginUser", async ({ login, password }, { rejectWithValue }) => {
  try {
    const response = await fetch("/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ login, password }),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save user");
    }

    const data = await response.json();
    return data;
  } catch (err) {
    if (err instanceof Error) {
      return rejectWithValue(err.message);
    } else {
      return rejectWithValue("Failed to save user");
    }
  }
});

export const fetchCurrentUser = createAsyncThunk<UserType, void, { rejectValue: ErrorType }>(
  "users/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/auth/current-user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch current user");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      } else {
        return rejectWithValue("Failed to fetch current user");
      }
    }
  }
);

export const logoutUser = createAsyncThunk<void, void, { rejectValue: ErrorType }>(
  "users/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to logout user");
      }

      return;
    } catch (err) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      } else {
        return rejectWithValue("Failed to logout user");
      }
    }
  }
);

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
  message: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    clearAuthMessage(state) {
      state.message = null;
    },
    resetAuthStatus(state) {
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<UserType>) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.message = "Успешный вход в систему";
      })
      .addCase(loginUser.rejected, (state, action: PayloadAction<ErrorType | undefined>) => {
        state.status = "failed";
        state.error = action.payload || "Failed to save user";
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<UserType>) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.status = "failed";
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.status = "succeeded";
        state.user = null;
        state.message = "Успешный выход из системы";
      })
      .addCase(logoutUser.rejected, (state, action: PayloadAction<ErrorType | undefined>) => {
        state.status = "failed";
        state.error = action.payload || "Failed to logout user";
      });
  },
});

export default authSlice.reducer;
export const { clearAuthError, clearAuthMessage, resetAuthStatus } = authSlice.actions;
export const selectCurrentUserId = (state: { auth: AuthState }): number | null =>
  state.auth.user?.user.id ?? null;

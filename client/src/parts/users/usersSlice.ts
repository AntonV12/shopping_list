import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export type UserType = {
  id?: number | null;
  login: string;
  password: string;
  categories: string[];
};

export type statusType = "idle" | "loading" | "succeeded" | "failed";

export type ErrorType = string | null;

export interface UserState {
  users: UserType[];
  currentUser: UserType | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: ErrorType;
  message: string | null;
}

export const registerUser = createAsyncThunk<UserType, UserType, { rejectValue: ErrorType }>(
  "users/registerUser",
  async (user, { rejectWithValue }) => {
    try {
      const response = await fetch("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
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

export const fetchUserCategoriesById = createAsyncThunk<UserType, number, { rejectValue: ErrorType }>(
  "users/fetchUserById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`/auth/users/${id}/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch user");
      }

      return await response.json();
    } catch (err) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      } else {
        return rejectWithValue("Failed to fetch user");
      }
    }
  }
);

export const fetchUsers = createAsyncThunk<UserType[], void, { rejectValue: ErrorType }>(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/auth/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch users");
      }
      return await response.json();
    } catch (err) {
      if (err instanceof Error) {
        return rejectWithValue(err.message);
      } else {
        return rejectWithValue("Failed to fetch users");
      }
    }
  }
);

export const updateUser = createAsyncThunk<
  UserType,
  {
    user: UserType;
  },
  { rejectValue: ErrorType }
>("users/updateUser", async ({ user }, { rejectWithValue }) => {
  try {
    const response = await fetch(`/auth/users/${user.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save user");
    }

    return await response.json();
  } catch (err) {
    if (err instanceof Error) {
      return rejectWithValue("Ошибка обновления. Сервер не отвечает");
    } else {
      return rejectWithValue("Failed to save user");
    }
  }
});

const initialState: UserState = {
  users: [],
  currentUser: null,
  status: "idle",
  error: null,
  message: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserError(state) {
      state.error = null;
    },
    clearUserMessage(state) {
      state.message = null;
    },
    resetUserStatus(state) {
      state.status = "idle";
    },
    setUserError(state, action: PayloadAction<ErrorType>) {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<UserType>) => {
        state.status = "succeeded";
        state.users.push(action.payload);
        state.message = "Пользователь успешно зарегистрирован";
      })
      .addCase(registerUser.rejected, (state, action: PayloadAction<ErrorType | undefined>) => {
        state.status = "failed";
        state.error = action.payload || "Failed to save user";
      })
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<UserType[]>) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action: PayloadAction<ErrorType | undefined>) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch users";
      })
      .addCase(updateUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateUser.fulfilled, (state, action: PayloadAction<UserType>) => {
        state.status = "succeeded";
        const { id, login, password, categories } = action.payload;
        const existingUser = state.users.find((user) => user.id == id);

        if (existingUser) {
          existingUser.login = login;
          existingUser.password = password;
          existingUser.categories = categories;
        }

        state.message = "Категории успешно обновлены";
      })
      .addCase(updateUser.rejected, (state, action: PayloadAction<ErrorType | undefined>) => {
        state.status = "failed";
        state.error = action.payload || "Failed to save user";
      })
      .addCase(fetchUserCategoriesById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUserCategoriesById.fulfilled, (state, action: PayloadAction<UserType>) => {
        state.status = "succeeded";
        state.currentUser = action.payload;
      })
      .addCase(fetchUserCategoriesById.rejected, (state, action: PayloadAction<ErrorType | undefined>) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch user categories";
      });
  },
});

export default usersSlice.reducer;
export const { clearUserError, clearUserMessage, resetUserStatus, setUserError } = usersSlice.actions;
export const selectAllUsers = (state: { users: { users: UserType[] } }) => state.users.users;
export const selectUserById = (state: { users: UserState }, userId: number) => {
  if (userId) {
    return state.users.currentUser;
  }
};

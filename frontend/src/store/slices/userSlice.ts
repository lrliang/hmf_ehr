import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { message } from 'antd';
import { userApi } from '@/services/user';
import type { User, PaginationParams } from '@/types';

// 错误类型
interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// 状态类型
interface UserState {
  users: User[];
  currentUser: User | null;
  total: number;
  loading: boolean;
  error: string | null;
  searchKeyword: string;
}

// 初始状态
const initialState: UserState = {
  users: [],
  currentUser: null,
  total: 0,
  loading: false,
  error: null,
  searchKeyword: '',
};

// 异步actions
export const fetchUsersAsync = createAsyncThunk(
  'user/fetchUsers',
  async (params: PaginationParams = {}, { rejectWithValue }) => {
    try {
      const response = await userApi.getUsers(params);
      return response;
    } catch (error: unknown) {
      const errorMessage = (error as ErrorResponse).response?.data?.message || '获取用户列表失败';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createUserAsync = createAsyncThunk(
  'user/createUser',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await userApi.createUser(userData);
      message.success('用户创建成功');
      return response;
    } catch (error: unknown) {
      const errorMessage = (error as ErrorResponse).response?.data?.message || '创建用户失败';
      message.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateUserAsync = createAsyncThunk(
  'user/updateUser',
  async ({ id, data }: { id: number; data: Partial<User> }, { rejectWithValue }) => {
    try {
      const response = await userApi.updateUser(id, data);
      message.success('用户更新成功');
      return response;
    } catch (error: unknown) {
      const errorMessage = (error as ErrorResponse).response?.data?.message || '更新用户失败';
      message.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteUserAsync = createAsyncThunk(
  'user/deleteUser',
  async (id: number, { rejectWithValue }) => {
    try {
      await userApi.deleteUser(id);
      message.success('用户删除成功');
      return id;
    } catch (error: unknown) {
      const errorMessage = (error as ErrorResponse).response?.data?.message || '删除用户失败';
      message.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchUserByIdAsync = createAsyncThunk(
  'user/fetchUserById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await userApi.getUserById(id);
      return response;
    } catch (error: unknown) {
      const errorMessage = (error as ErrorResponse).response?.data?.message || '获取用户详情失败';
      return rejectWithValue(errorMessage);
    }
  }
);

// slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    // 设置搜索关键词
    setSearchKeyword: (state, action: PayloadAction<string>) => {
      state.searchKeyword = action.payload;
    },
    // 清空当前用户
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    // 重置状态
    resetUserState: () => initialState,
  },
  extraReducers: (builder) => {
    // 获取用户列表
    builder
      .addCase(fetchUsersAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.total = action.payload.total;
        state.error = null;
      })
      .addCase(fetchUsersAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 创建用户
    builder
      .addCase(createUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.users.unshift(action.payload);
        state.total += 1;
        state.error = null;
      })
      .addCase(createUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 更新用户
    builder
      .addCase(updateUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload;
        }
        state.error = null;
      })
      .addCase(updateUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 删除用户
    builder
      .addCase(deleteUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        state.total -= 1;
        if (state.currentUser?.id === action.payload) {
          state.currentUser = null;
        }
        state.error = null;
      })
      .addCase(deleteUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取用户详情
    builder
      .addCase(fetchUserByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUserByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setSearchKeyword, clearCurrentUser, resetUserState } = userSlice.actions;
export default userSlice.reducer;

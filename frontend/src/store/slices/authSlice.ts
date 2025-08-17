import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { message } from 'antd';
import { authApi } from '@/services/auth';
import type { User, LoginRequest } from '@/types';

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
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

// 异步actions
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      message.success('登录成功');
      return response;
    } catch (error: unknown) {
      const errorMessage = (error as ErrorResponse).response?.data?.message || '登录失败';
      message.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // 可以调用后端登出接口
      // await authApi.logout();
      message.success('已退出登录');
      return true;
    } catch (error: unknown) {
      const errorMessage = (error as ErrorResponse).response?.data?.message || '退出登录失败';
      return rejectWithValue(errorMessage);
    }
  }
);

export const refreshTokenAsync = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      // 刷新token的逻辑
      // const response = await authApi.refreshToken();
      // return response;
      
      // 临时返回 null，后续实现时需要返回正确的类型
      return null as null;
    } catch (error: unknown) {
      const errorMessage = (error as ErrorResponse).response?.data?.message || '刷新token失败';
      return rejectWithValue(errorMessage);
    }
  }
);

// slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // 清除错误
    clearError: (state) => {
      state.error = null;
    },
    // 设置用户信息
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    // 更新token
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
    },
    // 重置状态
    resetAuth: () => initialState,
  },
  extraReducers: (builder) => {
    // 登录
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = action.payload as string;
      });

    // 退出登录
    builder
      .addCase(logoutAsync.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.loading = false;
        state.error = null;
      });

    // 刷新token
    builder
      .addCase(refreshTokenAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.loading = false;
        // 当前 refreshTokenAsync 返回 null，后续实现时需要处理实际的 token 数据
        if (action.payload) {
          // state.token = action.payload.access_token;
          // state.user = action.payload.user;
        }
      })
      .addCase(refreshTokenAsync.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { clearError, setUser, setToken, resetAuth } = authSlice.actions;
export default authSlice.reducer;

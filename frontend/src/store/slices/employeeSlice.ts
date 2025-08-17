import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { message } from 'antd';
import { employeeApi } from '@/services/employee';
import type { Employee, PaginationParams } from '@/types';

// 错误类型
interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// 过滤条件类型
interface EmployeeFilters {
  status?: string;
  storeId?: number;
  positionId?: number;
}

// 状态类型
interface EmployeeState {
  employees: Employee[];
  currentEmployee: Employee | null;
  total: number;
  loading: boolean;
  error: string | null;
  searchKeyword: string;
  filters: EmployeeFilters;
}

// 初始状态
const initialState: EmployeeState = {
  employees: [],
  currentEmployee: null,
  total: 0,
  loading: false,
  error: null,
  searchKeyword: '',
  filters: {},
};

// 异步actions
export const fetchEmployeesAsync = createAsyncThunk(
  'employee/fetchEmployees',
  async (params: PaginationParams & { keyword?: string; filters?: EmployeeFilters } = {}, { rejectWithValue }) => {
    try {
      const response = await employeeApi.getEmployees(params);
      return response;
    } catch (error: unknown) {
      const errorMessage = (error as ErrorResponse).response?.data?.message || '获取员工列表失败';
      return rejectWithValue(errorMessage);
    }
  }
);

export const createEmployeeAsync = createAsyncThunk(
  'employee/createEmployee',
  async (employeeData: Partial<Employee>, { rejectWithValue }) => {
    try {
      const response = await employeeApi.createEmployee(employeeData);
      message.success('员工创建成功');
      return response;
    } catch (error: unknown) {
      const errorMessage = (error as ErrorResponse).response?.data?.message || '创建员工失败';
      message.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateEmployeeAsync = createAsyncThunk(
  'employee/updateEmployee',
  async ({ id, data }: { id: number; data: Partial<Employee> }, { rejectWithValue }) => {
    try {
      const response = await employeeApi.updateEmployee(id, data);
      message.success('员工信息更新成功');
      return response;
    } catch (error: unknown) {
      const errorMessage = (error as ErrorResponse).response?.data?.message || '更新员工信息失败';
      message.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const deleteEmployeeAsync = createAsyncThunk(
  'employee/deleteEmployee',
  async (id: number, { rejectWithValue }) => {
    try {
      await employeeApi.deleteEmployee(id);
      message.success('员工删除成功');
      return id;
    } catch (error: unknown) {
      const errorMessage = (error as ErrorResponse).response?.data?.message || '删除员工失败';
      message.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchEmployeeByIdAsync = createAsyncThunk(
  'employee/fetchEmployeeById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await employeeApi.getEmployeeById(id);
      return response;
    } catch (error: unknown) {
      const errorMessage = (error as ErrorResponse).response?.data?.message || '获取员工详情失败';
      return rejectWithValue(errorMessage);
    }
  }
);

// slice
const employeeSlice = createSlice({
  name: 'employee',
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
    // 设置过滤条件
    setFilters: (state, action: PayloadAction<Partial<EmployeeFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    // 清空过滤条件
    clearFilters: (state) => {
      state.filters = {};
      state.searchKeyword = '';
    },
    // 清空当前员工
    clearCurrentEmployee: (state) => {
      state.currentEmployee = null;
    },
    // 重置状态
    resetEmployeeState: () => initialState,
  },
  extraReducers: (builder) => {
    // 获取员工列表
    builder
      .addCase(fetchEmployeesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload.data;
        state.total = action.payload.total;
        state.error = null;
      })
      .addCase(fetchEmployeesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 创建员工
    builder
      .addCase(createEmployeeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmployeeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.employees.unshift(action.payload);
        state.total += 1;
        state.error = null;
      })
      .addCase(createEmployeeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 更新员工
    builder
      .addCase(updateEmployeeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmployeeAsync.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.employees.findIndex(employee => employee.id === action.payload.id);
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
        if (state.currentEmployee?.id === action.payload.id) {
          state.currentEmployee = action.payload;
        }
        state.error = null;
      })
      .addCase(updateEmployeeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 删除员工
    builder
      .addCase(deleteEmployeeAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEmployeeAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = state.employees.filter(employee => employee.id !== action.payload);
        state.total -= 1;
        if (state.currentEmployee?.id === action.payload) {
          state.currentEmployee = null;
        }
        state.error = null;
      })
      .addCase(deleteEmployeeAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // 获取员工详情
    builder
      .addCase(fetchEmployeeByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEmployee = action.payload;
        state.error = null;
      })
      .addCase(fetchEmployeeByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  setSearchKeyword, 
  setFilters, 
  clearFilters,
  clearCurrentEmployee, 
  resetEmployeeState 
} = employeeSlice.actions;

export default employeeSlice.reducer;
